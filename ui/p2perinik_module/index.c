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
#include "crypto.h"
#include <emscripten/emscripten.h>

char * EMSCRIPTEN_KEEPALIVE P2PERINIK_Encrypt(char * bytes, char * key){
	struct Encrypted_Passphrase enc = Encrypt(bytes, key);
	return enc.encrypted_bytes;
}

char * EMSCRIPTEN_KEEPALIVE P2PERINIK_Encrypt_Default(char * bytes, char ** passphrase_output){
	struct Encrypted_Passphrase enc = Encrypt_Default(bytes);
	memcpy(*passphrase_output, enc.key, strlen(enc.key)+1);
	return enc.encrypted_bytes;
}

char * EMSCRIPTEN_KEEPALIVE P2PERINIK_Decrypt(char * encrypted, uint8_t * key){
	struct Encrypted_Passphrase enc;
	enc.encrypted_bytes = encrypted;
	enc.key = key;
	return Decrypt(enc);
}

int main(int argc, char ** argv) {
    printf("WebAssembly P2PERINIK module loaded\n");
}