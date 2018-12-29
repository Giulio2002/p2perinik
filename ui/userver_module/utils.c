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
#include "utils.h"

char * parseName(char * res) {
	char * retval = malloc(sizeof(char) * 42);
	unsigned int i = 0;
	unsigned int j = 0;
	// Get the index where the address start
	while(res[i] != ':')
		i++;
	i += 2;
	// Retrieve name
	while(res[i] != '\'') {
		retval[j] = res[i];
		j++;
	}
	return retval;
}

char * getContent(char * res) {
	char * content = malloc(sizeof(char) * 500);
	unsigned int start = 0;
	unsigned int i = 0;
	// Find the start of the json
	while(res[start] != '{')
		start++;
	// Retrieve content
	while(res[start + i] != '}'){
		content[i] = res[start + i];
		i++;
	}
	content[i + 1] = '}';
	// Return value
	return content;
}

EM_JS(char *, getAddress, (), {
	str = localStorage.getItem("address");
    var utf8 = [];
    for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6), 
                      0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            charcode = ((charcode&0x3ff)<<10)|(str.charCodeAt(i)&0x3ff)
            utf8.push(0xf0 | (charcode >>18), 
                      0x80 | ((charcode>>12) & 0x3f), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
})

EM_JS(char*, getLoginName, (), {
  return UTF8ToString(document.getElementById(UTF8ToString("nameInput")).value);
})

EM_JS(void, setName, (char* str), {
  document.getElementById(UTF8ToString("address")).value = UTF8ToString(str);
})

EM_JS(int , SetupLocalStorage, (char* json), {
  let tmp = JSON.Parse(UTF8ToString(json));	
  if (tmp.address == "undefined") return 0;
  localStorage.setKey("address", tmp.address);
  localStorage.setKey("pvt", tmp.pvt);
  return 1;
})