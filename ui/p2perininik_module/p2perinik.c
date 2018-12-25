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
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <string.h>
#include <stdint.h>
#include <emscripten/emscripten.h>

#define INIT_RAND srand(time(NULL))
// Tell us if ADDRESS must be in EIP55
#define ADDRESS_EIP55 true
// create new UINT8 PTR
#define NEW_KEY(size) malloc(sizeof(uint8_t) * size)
// Calculation for Default Passphrase
#define PIECE_PASSPHRASE (rand() % UINT8_MAX)
/* Debug Section */
// Debug switch
#define DEBUG false
// Display Backtrace (Only if DEBUG is true)
#define DISPLAY_BACKTRACE do { \
	  if(debug) { \
		  void *array[10]; \
		  size_t size; \
		  char **strings; \
		  size_t i; \
		  size = backtrace (array, 10); \
		  strings = backtrace_symbols (array, size); \
		  // Please don't kill me with PRs for this \
		  system("clear"); \
		  printf ("Obtained %zd stack frames.\n", size); \
		  for (i = 0; i < size; i++) \
		     printf ("%s\n", strings[i]); \
		  free (strings); \
	  } \
	 } while(0)
#define BREAKPOINT_TIME 10 
#define BREAKPOINT if(DEBUG) sleep(BREAKPOINT_TIME)
// METADATA
#define RELEASE_NAME "The Birth" // Release name
#define ENVIRONMENT "Linux" // Operative System
#define COMPILER "gcc" // Compile used
#define LICENSE "MIT" // License
#define VERSION "1.0.0" // Version
// And... 
#define AUTHOR "Giulio Rebuffo" // Your only god

struct Encrypted_Passphrase {
	uint8_t * key;
	char * encrypted_bytes;
};

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

int main(int argc, char ** argv) {
    printf("WebAssembly P2PERINIK module loaded\n");
}

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