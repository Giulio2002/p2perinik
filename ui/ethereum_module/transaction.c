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

void onTransactionSuccess(emscripten_fetch_t *fetch) {
  alert("the money have been successfully transfered");  
  printf("%s\n", fetch->data);
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
  sprintf(data,"{\"jsonrpc\":\"2.0\",\"method\":\"eth_sendRawTransaction\",\"params\":[%s],\"id\":4}", signedTransaction);
  attr.requestData = data;
  attr.requestDataSize = sizeof(attr.requestData);
  attr.onsuccess = onTransactionSuccess;
  attr.onerror = onTransactionFail;
  emscripten_fetch(&attr, ETHEREUM_NODE);
}

EM_JS(char * , generateSignedTransaction, (char * receiver, unsigned long int eth), {
	const txParams = {
	  nonce: '0x6', // Replace by nonce for your account on geth node
	  gasPrice: '0x09184e72a000', 
	  gasLimit: '0x30000',
	  to: UTF8ToString(receiver), 
	  value: eth * (10 ** 18)
	};
	// Transaction is created
	const tx = new ethereumjs.Tx(txParams);
	const privKey = new ethereumjs.Buffer.Buffer.from(localStorage.getItem('pvt'), 'hex');
	// Transaction is signed
	tx.sign(privKey);
	const serializedTx = tx.serialize();
	const rawTx = '0x' + serializedTx.toString('hex');
	return allocate(intArrayFromString(rawTx), 'i8', ALLOC_NORMAL);
})