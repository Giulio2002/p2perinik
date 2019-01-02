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

void EMSCRIPTEN_KEEPALIVE executeNormalTx() {
  emscripten_fetch_attr_t attr;
  emscripten_fetch_attr_init(&attr);
  strcpy(attr.requestMethod, "POST");
  attr.attributes = EMSCRIPTEN_FETCH_LOAD_TO_MEMORY;
  char * data = malloc(sizeof(char) * 400);
  sprintf(data,"{\"jsonrpc\":\"2.0\",\"method\":\"eth_getTransactionCount\",\"params\":[\"%s\", \"latest\"],\"id\":4}", getAddress());
  printf("%s\n", data);
  attr.requestData = data;
  attr.requestDataSize = strlen(attr.requestData);
  const char * headers[] = {"Content-Type", "application/json", 0};
  attr.requestHeaders = headers;
  attr.onsuccess = onNonceSuccess;
  attr.onerror = onNonceFail;
  emscripten_fetch(&attr, ETHEREUM_NODE);
}

void EMSCRIPTEN_KEEPALIVE setupBalance() {
  emscripten_fetch_attr_t attr;
  emscripten_fetch_attr_init(&attr);
  strcpy(attr.requestMethod, "POST");
  attr.attributes = EMSCRIPTEN_FETCH_LOAD_TO_MEMORY;
  char * data = malloc(sizeof(char) * 400);
  sprintf(data,"{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"%s\", \"latest\"],\"id\":4}", getAddress());
  printf("%s\n", data);
  attr.requestData = data;
  attr.requestDataSize = strlen(attr.requestData);
  const char * headers[] = {"Content-Type", "application/json", 0};
  attr.requestHeaders = headers;
  attr.onsuccess = onBalanceRetrieved;
  attr.onerror = onBalanceFailed;
  emscripten_fetch(&attr, ETHEREUM_NODE);
}