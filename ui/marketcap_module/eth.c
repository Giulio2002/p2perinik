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
#include "eth.h"

float ethereumPrice = 0.0;

EM_JS(float , retrievePrice, (const char* json), {
  console.log(UTF8ToString(json).substring(
    0, 
    UTF8ToString(json).lastIndexOf("}") + 1
  ));	 
  let tmp = JSON.parse(UTF8ToString(json).substring(
    0, 
    UTF8ToString(json).lastIndexOf("]") + 1
  ));	
  return tmp[0].price_usd;
})

EM_JS(void , ERROR, (int status), {
  alert("Couldn't query ethereum price via API. status code: " + status);
})

void success(emscripten_fetch_t *fetch) {
  printf("%s\n", fetch->data);  
  ethereumPrice = retrievePrice(fetch->data);
  printf("%f\n", ethereumPrice);
  emscripten_fetch_close(fetch); 
}

void fail(emscripten_fetch_t *fetch) {
  ERROR(fetch->status);
  emscripten_fetch_close(fetch); // Also free data on failure.
}

void setupEthereumPrice(const char * address) {
  emscripten_fetch_attr_t attr;
  emscripten_fetch_attr_init(&attr);
  strcpy(attr.requestMethod, "GET");
  attr.attributes = EMSCRIPTEN_FETCH_LOAD_TO_MEMORY;
  attr.onsuccess = success;
  attr.onerror = fail;
  emscripten_fetch(&attr, address);
}