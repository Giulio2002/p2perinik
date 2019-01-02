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
#include "config.h"
#include "../utils/utils.h"
#include "../marketcap_module/eth.h"
#include "../userver_module/get.h"
#include <emscripten/fetch.h>
#include <emscripten/emscripten.h>
#include <string.h>

extern char * current_nonce;

void transact(char * signedTransaction);
char * generateSignedTransaction(const char * receiver,const char * nonce,float eth);
void obtainNonce();
void onNonceSuccess(emscripten_fetch_t *fetch);
void onNonceFail(emscripten_fetch_t *fetch);
void onBalanceRetrieved(emscripten_fetch_t *fetch);
void onBalanceFailed(emscripten_fetch_t *fetch);