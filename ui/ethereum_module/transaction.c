/******************************************************************************
 * Copyright (c) 2018-19 Giulio Rebuffo
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License version 2
 * as published by the Free Software Foundation; or, when distributed
 * separately from the Linux kernel or incorporated into other
 * software packages, subject to the following license:
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this source file (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
#include "ethereum.h"

char * current_nonce;

EM_JS(void , Alert_InfuraResponse, (const char * response), {
  tmp = JSON.parse(UTF8ToString(response).substring(
      0, 
      UTF8ToString(response).lastIndexOf("}") + 1
    ));
  if( tmp.error != undefined) {
    alert("error: " + tmp.error.message);
  } else {
    alert("The money has been successfully transfered");
  }
})

void onRecipientRetrieved(emscripten_fetch_t *fetch) {
  const char * eth_recipient = fetch->data;
  printf("Address: %s\n", eth_recipient);
  printf("First: %s\n", getElementById("value"));
  printf("Second: %f\n", atof(getElementById("value")));
  printf("Third: %f\n", USDToETH(atof(getElementById("value"))));
  char * tx = generateSignedTransaction(eth_recipient, current_nonce, USDToETH(atof(getElementById("value"))));
  transact(tx);
  free(tx);
  emscripten_fetch_close(fetch); 
}

void onRecipientFailed(emscripten_fetch_t *fetch) {
  printf("HTTP failure status code: %d.\n", fetch->status);
  emscripten_fetch_close(fetch); // Also free data on failure.
}

void onTransactionSuccess(emscripten_fetch_t *fetch) {
  Alert_InfuraResponse(fetch->data);
  emscripten_fetch_close(fetch); 
}

void onTransactionFail(emscripten_fetch_t *fetch) {
  printf("HTTP failure status code: %d.\n", fetch->status);
  emscripten_fetch_close(fetch); // Also free data on failure.
}

void transact(char * signedTransaction) {
  emscripten_fetch_attr_t attr;
  emscripten_fetch_attr_init(&attr);
  strcpy(attr.requestMethod, "POST");
  attr.attributes = EMSCRIPTEN_FETCH_LOAD_TO_MEMORY;
  char * data = malloc(sizeof(char) * 400);
  sprintf(data,"{\"jsonrpc\":\"2.0\",\"method\":\"eth_sendRawTransaction\",\"params\":[\"%s\"],\"id\":4}", signedTransaction);
  const char * headers[] = {"Content-Type", "application/json", 0};
  attr.requestHeaders = headers;
  attr.requestData = data;
  attr.requestDataSize = strlen(attr.requestData);
  attr.onsuccess = onTransactionSuccess;
  attr.onerror = onTransactionFail;
  emscripten_fetch(&attr, ETHEREUM_NODE);
}

void onNonceSuccess(emscripten_fetch_t *fetch) {
  printf("%s\n", fetch->data);
  strcpy(current_nonce, fetch->data);
  GET_Address(getElementById("to"), onRecipientRetrieved, onRecipientFailed);
  emscripten_fetch_close(fetch); 
  
}

void onNonceFail(emscripten_fetch_t *fetch) {
  printf("HTTP failure status code: %d.\n", fetch->status);
  emscripten_fetch_close(fetch); // Also free data on failure.
}

EM_JS(char * , generateSignedTransaction, (const char * receiver,const char * nonce,float eth), {
  tmp = JSON.parse(UTF8ToString(nonce).substring(
      0, 
      UTF8ToString(nonce).lastIndexOf("}") + 1
    ));
  let parsedNonce = tmp.result;
  tmp = JSON.parse(UTF8ToString(receiver).substring(
      0, 
      UTF8ToString(receiver).lastIndexOf("}") + 1
    ));
  let parsedAddress = tmp.address;
  if (parsedAddress === "0x0000000000000000000000000000000000000000") {
    alert("Recipient username doesn't exist");
    throw "Recipient username doesn't exist";
  }
  console.log(parsedNonce);
	const txParams = {
	  nonce: parseInt(parsedNonce, 16),
	  gasPrice: '0x3B9ACA00', 
	  gasLimit: '0x30000',
	  to: parsedAddress, 
	  value: eth * (10 ** 18)
	};
  console.log(txParams);
	// Transaction is created
	const tx = new ethereumjs.Tx(txParams);
	const privKey = new ethereumjs.Buffer.Buffer.from(localStorage.getItem('pvt'), 'hex');
	// Transaction is signed
	tx.sign(privKey);
	const serializedTx = tx.serialize();
	const rawTx = '0x' + serializedTx.toString('hex');
	return allocate(intArrayFromString(rawTx), 'i8', ALLOC_NORMAL);
})