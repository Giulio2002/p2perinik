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

struct Encrypted_Passphrase Encrypt(char * bytes, uint8_t * key) {
	char * encrypted_bytes = malloc(sizeof(char) * strlen(bytes));
	unsigned int i;
	key[0] = 0;
	key[1] = 0;
	for (i = 0;i < strlen(bytes); i++) {
		uint8_t c = bytes[i];
		c += key[i];
		encrypted_bytes[i] = c;
	}
	struct Encrypted_Passphrase enc;
	enc.encrypted_bytes = encrypted_bytes;
	enc.key = key;
	return enc;
}

struct Encrypted_Passphrase Encrypt_Default(char * bytes) {
	unsigned int i;
	uint8_t * key = NEW_KEY(strlen(bytes));
	char * encrypted_bytes = malloc(sizeof(char) * strlen(bytes));

	for (i = 0;i < strlen(bytes); i++) {
		key[i] = PIECE_PASSPHRASE;
		key[0] = 0; // 0x
		key[1] = 0; // 0x
		uint8_t c = bytes[i];
		c += key[i];
		encrypted_bytes[i] = c;
	}
	struct Encrypted_Passphrase enc;
	enc.encrypted_bytes = encrypted_bytes;
	enc.key = key;
	return enc;
}

char * Decrypt(struct Encrypted_Passphrase encrypted_bytes) {
	char * decrypted_bytes = malloc(sizeof(char) * strlen(encrypted_bytes.encrypted_bytes));
	unsigned int i;
	for (i = 0;i < strlen(encrypted_bytes.encrypted_bytes); i++) {
		decrypted_bytes[i] = encrypted_bytes.encrypted_bytes[i] - encrypted_bytes.key[i];
	}

	return decrypted_bytes;
}