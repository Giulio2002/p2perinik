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

EM_JS(char *, getAddress, (), {
	addr = localStorage.getItem("address");
	return allocate(intArrayFromString(addr), 'i8', ALLOC_NORMAL);
})

EM_JS(char*, getLoginName, (), {
  return allocate(intArrayFromString(document.getElementById("nameInput").value), 'i8', ALLOC_NORMAL);
})

EM_JS(void, setName, (const char* str), {
  let json = JSON.parse(UTF8ToString(str).substring(
    0, 
    UTF8ToString(str).lastIndexOf("}") + 1
  ));
  document.getElementById("name").innerHTML = json.name;
})

EM_JS(int , SetupLocalStorage, (const char* json), { 
  let tmp = JSON.parse(UTF8ToString(json).substring(
    0, 
    UTF8ToString(json).lastIndexOf("}") + 1
  ));	
  if (tmp.address === undefined) {
	  	alert(tmp.error);
	  	window.location.href = 'http://localhost:4200/';
	  	return 0;
  };
  localStorage.setItem("address", tmp.address);
  localStorage.setItem("pvt", tmp.pvt);
  return 1;
})

EM_JS(void, alert, (char* str), {
  alert(UTF8ToString(str));
})

EM_JS(char *, getElementById, (char* id), {
  var value = document.getElementById(UTF8ToString(id)).value;
  console.log(value);
  return allocate(intArrayFromString(value), 'i8', ALLOC_NORMAL);
})