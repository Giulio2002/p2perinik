// Copyright 2010 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = typeof Module !== 'undefined' ? Module : {};

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)
// {{PRE_JSES}}

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
var key;
for (key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

Module['arguments'] = [];
Module['thisProgram'] = './this.program';
Module['quit'] = function(status, toThrow) {
  throw toThrow;
};
Module['preRun'] = [];
Module['postRun'] = [];

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
ENVIRONMENT_IS_WEB = typeof window === 'object';
ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function' && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;


// Three configurations we can be running in:
// 1) We could be the application main() thread running in the main JS UI thread. (ENVIRONMENT_IS_WORKER == false and ENVIRONMENT_IS_PTHREAD == false)
// 2) We could be the application main() thread proxied to worker. (with Emscripten -s PROXY_TO_WORKER=1) (ENVIRONMENT_IS_WORKER == true, ENVIRONMENT_IS_PTHREAD == false)
// 3) We could be an application pthread running in a worker. (ENVIRONMENT_IS_WORKER == true and ENVIRONMENT_IS_PTHREAD == true)

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  } else {
    return scriptDirectory + path;
  }
}

if (ENVIRONMENT_IS_NODE) {
  scriptDirectory = __dirname + '/';

  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  var nodeFS;
  var nodePath;

  Module['read'] = function shell_read(filename, binary) {
    var ret;
      if (!nodeFS) nodeFS = require('fs');
      if (!nodePath) nodePath = require('path');
      filename = nodePath['normalize'](filename);
      ret = nodeFS['readFileSync'](filename);
    return binary ? ret : ret.toString();
  };

  Module['readBinary'] = function readBinary(filename) {
    var ret = Module['read'](filename, true);
    if (!ret.buffer) {
      ret = new Uint8Array(ret);
    }
    assert(ret.buffer);
    return ret;
  };

  if (process['argv'].length > 1) {
    Module['thisProgram'] = process['argv'][1].replace(/\\/g, '/');
  }

  Module['arguments'] = process['argv'].slice(2);

  if (typeof module !== 'undefined') {
    module['exports'] = Module;
  }

  process['on']('uncaughtException', function(ex) {
    // suppress ExitStatus exceptions from showing an error
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });
  // Currently node will swallow unhandled rejections, but this behavior is
  // deprecated, and in the future it will exit with error status.
  process['on']('unhandledRejection', abort);

  Module['quit'] = function(status) {
    process['exit'](status);
  };

  Module['inspect'] = function () { return '[Emscripten Module object]'; };
} else
if (ENVIRONMENT_IS_SHELL) {


  if (typeof read != 'undefined') {
    Module['read'] = function shell_read(f) {
      return read(f);
    };
  }

  Module['readBinary'] = function readBinary(f) {
    var data;
    if (typeof readbuffer === 'function') {
      return new Uint8Array(readbuffer(f));
    }
    data = read(f, 'binary');
    assert(typeof data === 'object');
    return data;
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof quit === 'function') {
    Module['quit'] = function(status) {
      quit(status);
    }
  }
} else
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (document.currentScript) { // web
    scriptDirectory = document.currentScript.src;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf('/')+1);
  } else {
    scriptDirectory = '';
  }


  Module['read'] = function shell_read(url) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      return xhr.responseText;
  };

  if (ENVIRONMENT_IS_WORKER) {
    Module['readBinary'] = function readBinary(url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.responseType = 'arraybuffer';
        xhr.send(null);
        return new Uint8Array(xhr.response);
    };
  }

  Module['readAsync'] = function readAsync(url, onload, onerror) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function xhr_onload() {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
        onload(xhr.response);
        return;
      }
      onerror();
    };
    xhr.onerror = onerror;
    xhr.send(null);
  };

  Module['setWindowTitle'] = function(title) { document.title = title };
} else
{
}

// Set up the out() and err() hooks, which are how we can print to stdout or
// stderr, respectively.
// If the user provided Module.print or printErr, use that. Otherwise,
// console.log is checked first, as 'print' on the web will open a print dialogue
// printErr is preferable to console.warn (works better in shells)
// bind(console) is necessary to fix IE/Edge closed dev tools panel behavior.
var out = Module['print'] || (typeof console !== 'undefined' ? console.log.bind(console) : (typeof print !== 'undefined' ? print : null));
var err = Module['printErr'] || (typeof printErr !== 'undefined' ? printErr : ((typeof console !== 'undefined' && console.warn.bind(console)) || out));

// Merge back in the overrides
for (key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
moduleOverrides = undefined;

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message



// Copyright 2017 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

// {{PREAMBLE_ADDITIONS}}

var STACK_ALIGN = 16;


function staticAlloc(size) {
  var ret = STATICTOP;
  STATICTOP = (STATICTOP + size + 15) & -16;
  return ret;
}

function dynamicAlloc(size) {
  var ret = HEAP32[DYNAMICTOP_PTR>>2];
  var end = (ret + size + 15) & -16;
  HEAP32[DYNAMICTOP_PTR>>2] = end;
  if (end >= TOTAL_MEMORY) {
    var success = enlargeMemory();
    if (!success) {
      HEAP32[DYNAMICTOP_PTR>>2] = ret;
      return 0;
    }
  }
  return ret;
}

function alignMemory(size, factor) {
  if (!factor) factor = STACK_ALIGN; // stack alignment (16-byte) by default
  var ret = size = Math.ceil(size / factor) * factor;
  return ret;
}

function getNativeTypeSize(type) {
  switch (type) {
    case 'i1': case 'i8': return 1;
    case 'i16': return 2;
    case 'i32': return 4;
    case 'i64': return 8;
    case 'float': return 4;
    case 'double': return 8;
    default: {
      if (type[type.length-1] === '*') {
        return 4; // A pointer
      } else if (type[0] === 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 === 0);
        return bits / 8;
      } else {
        return 0;
      }
    }
  }
}

function warnOnce(text) {
  if (!warnOnce.shown) warnOnce.shown = {};
  if (!warnOnce.shown[text]) {
    warnOnce.shown[text] = 1;
    err(text);
  }
}

var asm2wasmImports = { // special asm2wasm imports
    "f64-rem": function(x, y) {
        return x % y;
    },
    "debugger": function() {
        debugger;
    }
};



var jsCallStartIndex = 1;
var functionPointers = new Array(0);

// 'sig' parameter is only used on LLVM wasm backend
function addFunction(func, sig) {
  var base = 0;
  for (var i = base; i < base + 0; i++) {
    if (!functionPointers[i]) {
      functionPointers[i] = func;
      return jsCallStartIndex + i;
    }
  }
  throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
}

function removeFunction(index) {
  functionPointers[index-jsCallStartIndex] = null;
}

var funcWrappers = {};

function getFuncWrapper(func, sig) {
  if (!func) return; // on null pointer, return undefined
  assert(sig);
  if (!funcWrappers[sig]) {
    funcWrappers[sig] = {};
  }
  var sigCache = funcWrappers[sig];
  if (!sigCache[func]) {
    // optimize away arguments usage in common cases
    if (sig.length === 1) {
      sigCache[func] = function dynCall_wrapper() {
        return dynCall(sig, func);
      };
    } else if (sig.length === 2) {
      sigCache[func] = function dynCall_wrapper(arg) {
        return dynCall(sig, func, [arg]);
      };
    } else {
      // general case
      sigCache[func] = function dynCall_wrapper() {
        return dynCall(sig, func, Array.prototype.slice.call(arguments));
      };
    }
  }
  return sigCache[func];
}


function makeBigInt(low, high, unsigned) {
  return unsigned ? ((+((low>>>0)))+((+((high>>>0)))*4294967296.0)) : ((+((low>>>0)))+((+((high|0)))*4294967296.0));
}

function dynCall(sig, ptr, args) {
  if (args && args.length) {
    return Module['dynCall_' + sig].apply(null, [ptr].concat(args));
  } else {
    return Module['dynCall_' + sig].call(null, ptr);
  }
}

var tempRet0 = 0;

var setTempRet0 = function(value) {
  tempRet0 = value;
}

var getTempRet0 = function() {
  return tempRet0;
}


var Runtime = {
  // FIXME backwards compatibility layer for ports. Support some Runtime.*
  //       for now, fix it there, then remove it from here. That way we
  //       can minimize any period of breakage.
  dynCall: dynCall, // for SDL2 port
};

// The address globals begin at. Very low in memory, for code size and optimization opportunities.
// Above 0 is static memory, starting with globals.
// Then the stack.
// Then 'dynamic' memory for sbrk.
var GLOBAL_BASE = 1024;


// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html



//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS = 0;

/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module['_' + ident]; // closure exported function
  assert(func, 'Cannot call unknown function ' + ident + ', make sure it is exported');
  return func;
}

var JSfuncs = {
  // Helpers for cwrap -- it can't refer to Runtime directly because it might
  // be renamed by closure, instead it calls JSfuncs['stackSave'].body to find
  // out what the minified function name is.
  'stackSave': function() {
    stackSave()
  },
  'stackRestore': function() {
    stackRestore()
  },
  // type conversion from js to c
  'arrayToC' : function(arr) {
    var ret = stackAlloc(arr.length);
    writeArrayToMemory(arr, ret);
    return ret;
  },
  'stringToC' : function(str) {
    var ret = 0;
    if (str !== null && str !== undefined && str !== 0) { // null string
      // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
      var len = (str.length << 2) + 1;
      ret = stackAlloc(len);
      stringToUTF8(str, ret, len);
    }
    return ret;
  }
};

// For fast lookup of conversion functions
var toC = {
  'string': JSfuncs['stringToC'], 'array': JSfuncs['arrayToC']
};


// C calling interface.
function ccall(ident, returnType, argTypes, args, opts) {
  function convertReturnValue(ret) {
    if (returnType === 'string') return Pointer_stringify(ret);
    if (returnType === 'boolean') return Boolean(ret);
    return ret;
  }

  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  if (args) {
    for (var i = 0; i < args.length; i++) {
      var converter = toC[argTypes[i]];
      if (converter) {
        if (stack === 0) stack = stackSave();
        cArgs[i] = converter(args[i]);
      } else {
        cArgs[i] = args[i];
      }
    }
  }
  var ret = func.apply(null, cArgs);
  ret = convertReturnValue(ret);
  if (stack !== 0) stackRestore(stack);
  return ret;
}

function cwrap(ident, returnType, argTypes, opts) {
  argTypes = argTypes || [];
  // When the function takes numbers and returns a number, we can just return
  // the original function
  var numericArgs = argTypes.every(function(type){ return type === 'number'});
  var numericRet = returnType !== 'string';
  if (numericRet && numericArgs && !opts) {
    return getCFunc(ident);
  }
  return function() {
    return ccall(ident, returnType, argTypes, arguments, opts);
  }
}

/** @type {function(number, number, string, boolean=)} */
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[((ptr)>>0)]=value; break;
      case 'i8': HEAP8[((ptr)>>0)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}

/** @type {function(number, string, boolean=)} */
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for getValue: ' + type);
    }
  return null;
}

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
/** @type {function((TypedArray|Array<number>|number), string, number, number=)} */
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [typeof _malloc === 'function' ? _malloc : staticAlloc, stackAlloc, staticAlloc, dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var stop;
    ptr = ret;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)>>0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(/** @type {!Uint8Array} */ (slab), ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}

// Allocate memory during any stage of startup - static memory early on, dynamic memory later, malloc when ready
function getMemory(size) {
  if (!staticSealed) return staticAlloc(size);
  if (!runtimeInitialized) return dynamicAlloc(size);
  return _malloc(size);
}

/** @type {function(number, number=)} */
function Pointer_stringify(ptr, length) {
  if (length === 0 || !ptr) return '';
  // Find the length, and check for UTF while doing so
  var hasUtf = 0;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))>>0)];
    hasUtf |= t;
    if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (hasUtf < 128) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  return UTF8ToString(ptr);
}

// Given a pointer 'ptr' to a null-terminated ASCII-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function AsciiToString(ptr) {
  var str = '';
  while (1) {
    var ch = HEAP8[((ptr++)>>0)];
    if (!ch) return str;
    str += String.fromCharCode(ch);
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in ASCII form. The copy will require at most str.length+1 bytes of space in the HEAP.

function stringToAscii(str, outPtr) {
  return writeAsciiToMemory(str, outPtr, false);
}

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
// a copy of that string as a Javascript String object.

var UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined;
function UTF8ArrayToString(u8Array, idx) {
  var endPtr = idx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  while (u8Array[endPtr]) ++endPtr;

  if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
    return UTF8Decoder.decode(u8Array.subarray(idx, endPtr));
  } else {
    var u0, u1, u2, u3, u4, u5;

    var str = '';
    while (1) {
      // For UTF8 byte structure, see:
      // http://en.wikipedia.org/wiki/UTF-8#Description
      // https://www.ietf.org/rfc/rfc2279.txt
      // https://tools.ietf.org/html/rfc3629
      u0 = u8Array[idx++];
      if (!u0) return str;
      if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
      u1 = u8Array[idx++] & 63;
      if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
      u2 = u8Array[idx++] & 63;
      if ((u0 & 0xF0) == 0xE0) {
        u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
      } else {
        u3 = u8Array[idx++] & 63;
        if ((u0 & 0xF8) == 0xF0) {
          u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | u3;
        } else {
          u4 = u8Array[idx++] & 63;
          if ((u0 & 0xFC) == 0xF8) {
            u0 = ((u0 & 3) << 24) | (u1 << 18) | (u2 << 12) | (u3 << 6) | u4;
          } else {
            u5 = u8Array[idx++] & 63;
            u0 = ((u0 & 1) << 30) | (u1 << 24) | (u2 << 18) | (u3 << 12) | (u4 << 6) | u5;
          }
        }
      }
      if (u0 < 0x10000) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 0x10000;
        str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
      }
    }
  }
}

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function UTF8ToString(ptr) {
  return UTF8ArrayToString(HEAPU8,ptr);
}

// Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
// encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outU8Array: the array to copy to. Each index in this array is assumed to be one 8-byte element.
//   outIdx: The starting offset in the array to begin the copying.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array.
//                    This count should include the null terminator,
//                    i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
//                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
    return 0;

  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) {
      var u1 = str.charCodeAt(++i);
      u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
    }
    if (u <= 0x7F) {
      if (outIdx >= endIdx) break;
      outU8Array[outIdx++] = u;
    } else if (u <= 0x7FF) {
      if (outIdx + 1 >= endIdx) break;
      outU8Array[outIdx++] = 0xC0 | (u >> 6);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0xFFFF) {
      if (outIdx + 2 >= endIdx) break;
      outU8Array[outIdx++] = 0xE0 | (u >> 12);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0x1FFFFF) {
      if (outIdx + 3 >= endIdx) break;
      outU8Array[outIdx++] = 0xF0 | (u >> 18);
      outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0x3FFFFFF) {
      if (outIdx + 4 >= endIdx) break;
      outU8Array[outIdx++] = 0xF8 | (u >> 24);
      outU8Array[outIdx++] = 0x80 | ((u >> 18) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else {
      if (outIdx + 5 >= endIdx) break;
      outU8Array[outIdx++] = 0xFC | (u >> 30);
      outU8Array[outIdx++] = 0x80 | ((u >> 24) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 18) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    }
  }
  // Null-terminate the pointer to the buffer.
  outU8Array[outIdx] = 0;
  return outIdx - startIdx;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8(str, outPtr, maxBytesToWrite) {
  return stringToUTF8Array(str, HEAPU8,outPtr, maxBytesToWrite);
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
    if (u <= 0x7F) {
      ++len;
    } else if (u <= 0x7FF) {
      len += 2;
    } else if (u <= 0xFFFF) {
      len += 3;
    } else if (u <= 0x1FFFFF) {
      len += 4;
    } else if (u <= 0x3FFFFFF) {
      len += 5;
    } else {
      len += 6;
    }
  }
  return len;
}

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

var UTF16Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-16le') : undefined;
function UTF16ToString(ptr) {
  var endPtr = ptr;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  var idx = endPtr >> 1;
  while (HEAP16[idx]) ++idx;
  endPtr = idx << 1;

  if (endPtr - ptr > 32 && UTF16Decoder) {
    return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
  } else {
    var i = 0;

    var str = '';
    while (1) {
      var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
      if (codeUnit == 0) return str;
      ++i;
      // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
      str += String.fromCharCode(codeUnit);
    }
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16 form. The copy will require at most str.length*4+2 bytes of space in the HEAP.
// Use the function lengthBytesUTF16() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=2, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<2 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF16(str, outPtr, maxBytesToWrite) {
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 2) return 0;
  maxBytesToWrite -= 2; // Null terminator.
  var startPtr = outPtr;
  var numCharsToWrite = (maxBytesToWrite < str.length*2) ? (maxBytesToWrite / 2) : str.length;
  for (var i = 0; i < numCharsToWrite; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[((outPtr)>>1)]=codeUnit;
    outPtr += 2;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[((outPtr)>>1)]=0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF16(str) {
  return str.length*2;
}

function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32 form. The copy will require at most str.length*4+4 bytes of space in the HEAP.
// Use the function lengthBytesUTF32() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=4, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<4 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF32(str, outPtr, maxBytesToWrite) {
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 4) return 0;
  var startPtr = outPtr;
  var endPtr = startPtr + maxBytesToWrite - 4;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++i);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[((outPtr)>>2)]=codeUnit;
    outPtr += 4;
    if (outPtr + 4 > endPtr) break;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[((outPtr)>>2)]=0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF32(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i);
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
    len += 4;
  }

  return len;
}

// Allocate heap space for a JS string, and write it there.
// It is the responsibility of the caller to free() that memory.
function allocateUTF8(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = _malloc(size);
  if (ret) stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Allocate stack space for a JS string, and write it there.
function allocateUTF8OnStack(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = stackAlloc(size);
  stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

function demangle(func) {
  return func;
}

function demangleAll(text) {
  var regex =
    /__Z[\w\d_]+/g;
  return text.replace(regex,
    function(x) {
      var y = demangle(x);
      return x === y ? x : (y + ' [' + x + ']');
    });
}

function jsStackTrace() {
  var err = new Error();
  if (!err.stack) {
    // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
    // so try that as a special-case.
    try {
      throw new Error(0);
    } catch(e) {
      err = e;
    }
    if (!err.stack) {
      return '(no stack trace available)';
    }
  }
  return err.stack.toString();
}

function stackTrace() {
  var js = jsStackTrace();
  if (Module['extraStackTrace']) js += '\n' + Module['extraStackTrace']();
  return demangleAll(js);
}

// Memory management

var PAGE_SIZE = 16384;
var WASM_PAGE_SIZE = 65536;
var ASMJS_PAGE_SIZE = 16777216;
var MIN_TOTAL_MEMORY = 16777216;

function alignUp(x, multiple) {
  if (x % multiple > 0) {
    x += multiple - (x % multiple);
  }
  return x;
}

var HEAP,
/** @type {ArrayBuffer} */
  buffer,
/** @type {Int8Array} */
  HEAP8,
/** @type {Uint8Array} */
  HEAPU8,
/** @type {Int16Array} */
  HEAP16,
/** @type {Uint16Array} */
  HEAPU16,
/** @type {Int32Array} */
  HEAP32,
/** @type {Uint32Array} */
  HEAPU32,
/** @type {Float32Array} */
  HEAPF32,
/** @type {Float64Array} */
  HEAPF64;

function updateGlobalBuffer(buf) {
  Module['buffer'] = buffer = buf;
}

function updateGlobalBufferViews() {
  Module['HEAP8'] = HEAP8 = new Int8Array(buffer);
  Module['HEAP16'] = HEAP16 = new Int16Array(buffer);
  Module['HEAP32'] = HEAP32 = new Int32Array(buffer);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(buffer);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(buffer);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(buffer);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(buffer);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(buffer);
}

var STATIC_BASE, STATICTOP, staticSealed; // static area
var STACK_BASE, STACKTOP, STACK_MAX; // stack area
var DYNAMIC_BASE, DYNAMICTOP_PTR; // dynamic area handled by sbrk

  STATIC_BASE = STATICTOP = STACK_BASE = STACKTOP = STACK_MAX = DYNAMIC_BASE = DYNAMICTOP_PTR = 0;
  staticSealed = false;




function abortOnCannotGrowMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ');
}


function enlargeMemory() {
  abortOnCannotGrowMemory();
}


var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
if (TOTAL_MEMORY < TOTAL_STACK) err('TOTAL_MEMORY should be larger than TOTAL_STACK, was ' + TOTAL_MEMORY + '! (TOTAL_STACK=' + TOTAL_STACK + ')');

// Initialize the runtime's memory



// Use a provided buffer, if there is one, or else allocate a new one
if (Module['buffer']) {
  buffer = Module['buffer'];
} else {
  // Use a WebAssembly memory where available
  if (typeof WebAssembly === 'object' && typeof WebAssembly.Memory === 'function') {
    Module['wasmMemory'] = new WebAssembly.Memory({ 'initial': TOTAL_MEMORY / WASM_PAGE_SIZE, 'maximum': TOTAL_MEMORY / WASM_PAGE_SIZE });
    buffer = Module['wasmMemory'].buffer;
  } else
  {
    buffer = new ArrayBuffer(TOTAL_MEMORY);
  }
  Module['buffer'] = buffer;
}
updateGlobalBufferViews();


function getTotalMemory() {
  return TOTAL_MEMORY;
}

// Endianness check (note: assumes compiler arch was little-endian)

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Module['dynCall_v'](func);
      } else {
        Module['dynCall_vi'](func, callback.arg);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;
var runtimeExited = false;


function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
  runtimeExited = true;
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

// Deprecated: This function should not be called because it is unsafe and does not provide
// a maximum length limit of how many bytes it is allowed to write. Prefer calling the
// function stringToUTF8Array() instead, which takes in a maximum length that can be used
// to be secure from out of bounds writes.
/** @deprecated */
function writeStringToMemory(string, buffer, dontAddNull) {
  warnOnce('writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!');

  var /** @type {number} */ lastChar, /** @type {number} */ end;
  if (dontAddNull) {
    // stringToUTF8Array always appends null. If we don't want to do that, remember the
    // character that existed at the location where the null will be placed, and restore
    // that after the write (below).
    end = buffer + lengthBytesUTF8(string);
    lastChar = HEAP8[end];
  }
  stringToUTF8(string, buffer, Infinity);
  if (dontAddNull) HEAP8[end] = lastChar; // Restore the value under the null character.
}

function writeArrayToMemory(array, buffer) {
  HEAP8.set(array, buffer);
}

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
    HEAP8[((buffer++)>>0)]=str.charCodeAt(i);
  }
  // Null-terminate the pointer to the HEAP.
  if (!dontAddNull) HEAP8[((buffer)>>0)]=0;
}

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_round = Math.round;
var Math_min = Math.min;
var Math_max = Math.max;
var Math_clz32 = Math.clz32;
var Math_trunc = Math.trunc;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function getUniqueRunDependency(id) {
  return id;
}

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}

function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data



var memoryInitializer = null;






// Copyright 2017 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = 'data:application/octet-stream;base64,';

// Indicates whether filename is a base64 data URI.
function isDataURI(filename) {
  return String.prototype.startsWith ?
      filename.startsWith(dataURIPrefix) :
      filename.indexOf(dataURIPrefix) === 0;
}




function integrateWasmJS() {
  // wasm.js has several methods for creating the compiled code module here:
  //  * 'native-wasm' : use native WebAssembly support in the browser
  //  * 'interpret-s-expr': load s-expression code from a .wast and interpret
  //  * 'interpret-binary': load binary wasm and interpret
  //  * 'interpret-asm2wasm': load asm.js code, translate to wasm, and interpret
  //  * 'asmjs': no wasm, just load the asm.js code and use that (good for testing)
  // The method is set at compile time (BINARYEN_METHOD)
  // The method can be a comma-separated list, in which case, we will try the
  // options one by one. Some of them can fail gracefully, and then we can try
  // the next.

  // inputs

  var method = 'native-wasm';

  var wasmTextFile = 'index.wast';
  var wasmBinaryFile = 'index.wasm';
  var asmjsCodeFile = 'index.temp.asm.js';

  if (!isDataURI(wasmTextFile)) {
    wasmTextFile = locateFile(wasmTextFile);
  }
  if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile);
  }
  if (!isDataURI(asmjsCodeFile)) {
    asmjsCodeFile = locateFile(asmjsCodeFile);
  }

  // utilities

  var wasmPageSize = 64*1024;

  var info = {
    'global': null,
    'env': null,
    'asm2wasm': asm2wasmImports,
    'parent': Module // Module inside wasm-js.cpp refers to wasm-js.cpp; this allows access to the outside program.
  };

  var exports = null;


  function mergeMemory(newBuffer) {
    // The wasm instance creates its memory. But static init code might have written to
    // buffer already, including the mem init file, and we must copy it over in a proper merge.
    // TODO: avoid this copy, by avoiding such static init writes
    // TODO: in shorter term, just copy up to the last static init write
    var oldBuffer = Module['buffer'];
    if (newBuffer.byteLength < oldBuffer.byteLength) {
      err('the new buffer in mergeMemory is smaller than the previous one. in native wasm, we should grow memory here');
    }
    var oldView = new Int8Array(oldBuffer);
    var newView = new Int8Array(newBuffer);


    newView.set(oldView);
    updateGlobalBuffer(newBuffer);
    updateGlobalBufferViews();
  }

  function getBinary() {
    try {
      if (Module['wasmBinary']) {
        return new Uint8Array(Module['wasmBinary']);
      }
      if (Module['readBinary']) {
        return Module['readBinary'](wasmBinaryFile);
      } else {
        throw "both async and sync fetching of the wasm failed";
      }
    }
    catch (err) {
      abort(err);
    }
  }

  function getBinaryPromise() {
    // if we don't have the binary yet, and have the Fetch api, use that
    // in some environments, like Electron's render process, Fetch api may be present, but have a different context than expected, let's only use it on the Web
    if (!Module['wasmBinary'] && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && typeof fetch === 'function') {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function(response) {
        if (!response['ok']) {
          throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
        }
        return response['arrayBuffer']();
      }).catch(function () {
        return getBinary();
      });
    }
    // Otherwise, getBinary should be able to get it synchronously
    return new Promise(function(resolve, reject) {
      resolve(getBinary());
    });
  }

  // do-method functions


  function doNativeWasm(global, env, providedBuffer) {
    if (typeof WebAssembly !== 'object') {
      err('no native wasm support detected');
      return false;
    }
    // prepare memory import
    if (!(Module['wasmMemory'] instanceof WebAssembly.Memory)) {
      err('no native wasm Memory in use');
      return false;
    }
    env['memory'] = Module['wasmMemory'];
    // Load the wasm module and create an instance of using native support in the JS engine.
    info['global'] = {
      'NaN': NaN,
      'Infinity': Infinity
    };
    info['global.Math'] = Math;
    info['env'] = env;
    // handle a generated wasm instance, receiving its exports and
    // performing other necessary setup
    function receiveInstance(instance, module) {
      exports = instance.exports;
      if (exports.memory) mergeMemory(exports.memory);
      Module['asm'] = exports;
      Module["usingWasm"] = true;
      removeRunDependency('wasm-instantiate');
    }
    addRunDependency('wasm-instantiate');

    // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
    // to manually instantiate the Wasm module themselves. This allows pages to run the instantiation parallel
    // to any other async startup actions they are performing.
    if (Module['instantiateWasm']) {
      try {
        return Module['instantiateWasm'](info, receiveInstance);
      } catch(e) {
        err('Module.instantiateWasm callback failed with error: ' + e);
        return false;
      }
    }

    function receiveInstantiatedSource(output) {
      // 'output' is a WebAssemblyInstantiatedSource object which has both the module and instance.
      // receiveInstance() will swap in the exports (to Module.asm) so they can be called
      receiveInstance(output['instance'], output['module']);
    }
    function instantiateArrayBuffer(receiver) {
      getBinaryPromise().then(function(binary) {
        return WebAssembly.instantiate(binary, info);
      }).then(receiver, function(reason) {
        err('failed to asynchronously prepare wasm: ' + reason);
        abort(reason);
      });
    }
    // Prefer streaming instantiation if available.
    if (!Module['wasmBinary'] &&
        typeof WebAssembly.instantiateStreaming === 'function' &&
        !isDataURI(wasmBinaryFile) &&
        typeof fetch === 'function') {
      WebAssembly.instantiateStreaming(fetch(wasmBinaryFile, { credentials: 'same-origin' }), info)
        .then(receiveInstantiatedSource, function(reason) {
          // We expect the most common failure cause to be a bad MIME type for the binary,
          // in which case falling back to ArrayBuffer instantiation should work.
          err('wasm streaming compile failed: ' + reason);
          err('falling back to ArrayBuffer instantiation');
          instantiateArrayBuffer(receiveInstantiatedSource);
        });
    } else {
      instantiateArrayBuffer(receiveInstantiatedSource);
    }
    return {}; // no exports yet; we'll fill them in later
  }


  // We may have a preloaded value in Module.asm, save it
  Module['asmPreload'] = Module['asm'];

  // Memory growth integration code

  var asmjsReallocBuffer = Module['reallocBuffer'];

  var wasmReallocBuffer = function(size) {
    var PAGE_MULTIPLE = Module["usingWasm"] ? WASM_PAGE_SIZE : ASMJS_PAGE_SIZE; // In wasm, heap size must be a multiple of 64KB. In asm.js, they need to be multiples of 16MB.
    size = alignUp(size, PAGE_MULTIPLE); // round up to wasm page size
    var old = Module['buffer'];
    var oldSize = old.byteLength;
    if (Module["usingWasm"]) {
      // native wasm support
      try {
        var result = Module['wasmMemory'].grow((size - oldSize) / wasmPageSize); // .grow() takes a delta compared to the previous size
        if (result !== (-1 | 0)) {
          // success in native wasm memory growth, get the buffer from the memory
          return Module['buffer'] = Module['wasmMemory'].buffer;
        } else {
          return null;
        }
      } catch(e) {
        return null;
      }
    }
  };

  Module['reallocBuffer'] = function(size) {
    if (finalMethod === 'asmjs') {
      return asmjsReallocBuffer(size);
    } else {
      return wasmReallocBuffer(size);
    }
  };

  // we may try more than one; this is the final one, that worked and we are using
  var finalMethod = '';

  // Provide an "asm.js function" for the application, called to "link" the asm.js module. We instantiate
  // the wasm module at that time, and it receives imports and provides exports and so forth, the app
  // doesn't need to care that it is wasm or polyfilled wasm or asm.js.

  Module['asm'] = function(global, env, providedBuffer) {
    // import table
    if (!env['table']) {
      var TABLE_SIZE = Module['wasmTableSize'];
      if (TABLE_SIZE === undefined) TABLE_SIZE = 1024; // works in binaryen interpreter at least
      var MAX_TABLE_SIZE = Module['wasmMaxTableSize'];
      if (typeof WebAssembly === 'object' && typeof WebAssembly.Table === 'function') {
        if (MAX_TABLE_SIZE !== undefined) {
          env['table'] = new WebAssembly.Table({ 'initial': TABLE_SIZE, 'maximum': MAX_TABLE_SIZE, 'element': 'anyfunc' });
        } else {
          env['table'] = new WebAssembly.Table({ 'initial': TABLE_SIZE, element: 'anyfunc' });
        }
      } else {
        env['table'] = new Array(TABLE_SIZE); // works in binaryen interpreter at least
      }
      Module['wasmTable'] = env['table'];
    }

    if (!env['__memory_base']) {
      env['__memory_base'] = Module['STATIC_BASE']; // tell the memory segments where to place themselves
    }
    if (!env['__table_base']) {
      env['__table_base'] = 0; // table starts at 0 by default, in dynamic linking this will change
    }

    // try the methods. each should return the exports if it succeeded

    var exports;
    exports = doNativeWasm(global, env, providedBuffer);

    assert(exports, 'no binaryen method succeeded.');


    return exports;
  };

  var methodHandler = Module['asm']; // note our method handler, as we may modify Module['asm'] later
}

integrateWasmJS();

// === Body ===

var ASM_CONSTS = [];

function _Alert_InfuraResponse(response){ tmp = JSON.parse(UTF8ToString(response).substring( 0, UTF8ToString(response).lastIndexOf("}") + 1 )); if( tmp.error != undefined) { alert("error: " + tmp.error.message); } else { alert("The money has been successfully transfered"); } }
function _ERROR(status){ alert("Couldn't query ethereum price via API. status code: " + status); }
function _SetupLocalStorage(json){ let tmp = JSON.parse(UTF8ToString(json).substring( 0, UTF8ToString(json).lastIndexOf("}") + 1 )); if (tmp.address === undefined) { alert(tmp.error); window.location.href = 'http://localhost:4200/'; return 0; }; localStorage.setItem("address", tmp.address); localStorage.setItem("pvt", tmp.pvt); return 1; }
function _alert(str){ alert(UTF8ToString(str)); }
function _generateSignedTransaction(receiver,nonce,eth){ tmp = JSON.parse(UTF8ToString(nonce).substring( 0, UTF8ToString(nonce).lastIndexOf("}") + 1 )); let parsedNonce = tmp.result; tmp = JSON.parse(UTF8ToString(receiver).substring( 0, UTF8ToString(receiver).lastIndexOf("}") + 1 )); let parsedAddress = tmp.address; if (parsedAddress === "0x0000000000000000000000000000000000000000") { alert("Recipient username doesn't exist"); throw "Recipient username doesn't exist"; } console.log(parsedNonce); const txParams = { nonce: parseInt(parsedNonce, 16), gasPrice: '0x3B9ACA00', gasLimit: '0x30000', to: parsedAddress, value: eth * (10 ** 18) }; console.log(txParams); const tx = new ethereumjs.Tx(txParams); const privKey = new ethereumjs.Buffer.Buffer.from(localStorage.getItem('pvt'), 'hex'); tx.sign(privKey); const serializedTx = tx.serialize(); const rawTx = '0x' + serializedTx.toString('hex'); return allocate(intArrayFromString(rawTx), 'i8', ALLOC_NORMAL); }
function _getAddress(){ addr = localStorage.getItem("address"); return allocate(intArrayFromString(addr), 'i8', ALLOC_NORMAL); }
function _getElementById(id){ var value = document.getElementById(UTF8ToString(id)).value; console.log(value); return allocate(intArrayFromString(value), 'i8', ALLOC_NORMAL); }
function _getLoginName(){ return allocate(intArrayFromString(document.getElementById("nameInput").value), 'i8', ALLOC_NORMAL); }
function _retrievePrice(json){ console.log(UTF8ToString(json).substring( 0, UTF8ToString(json).lastIndexOf("}") + 1 )); let tmp = JSON.parse(UTF8ToString(json).substring( 0, UTF8ToString(json).lastIndexOf("]") + 1 )); return tmp[0].price_usd; }
function _setBalance(json){ tmp = JSON.parse(UTF8ToString(json).substring( 0, UTF8ToString(json).lastIndexOf("}") + 1 )); if( tmp.error != undefined) { alert("Couldn't retrieve balance"); } else { document.getElementById("balance").innerHTML = "(" + _ETHToUSD(tmp.result / (10 ** 18)).toFixed(2) + " $)"; } }
function _setName(str){ let json = JSON.parse(UTF8ToString(str).substring( 0, UTF8ToString(str).lastIndexOf("}") + 1 )); document.getElementById("name").innerHTML = json.name; }



STATIC_BASE = GLOBAL_BASE;

STATICTOP = STATIC_BASE + 9024;
/* global initializers */  __ATINIT__.push();







var STATIC_BUMP = 9024;
Module["STATIC_BASE"] = STATIC_BASE;
Module["STATIC_BUMP"] = STATIC_BUMP;

/* no memory initializer */
var tempDoublePtr = STATICTOP; STATICTOP += 16;

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}

function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}

// {{PRE_LIBRARY}}


  
  
  function _emscripten_set_main_loop_timing(mode, value) {
      Browser.mainLoop.timingMode = mode;
      Browser.mainLoop.timingValue = value;
  
      if (!Browser.mainLoop.func) {
        return 1; // Return non-zero on failure, can't set timing mode when there is no main loop.
      }
  
      if (mode == 0 /*EM_TIMING_SETTIMEOUT*/) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
          var timeUntilNextTick = Math.max(0, Browser.mainLoop.tickStartTime + value - _emscripten_get_now())|0;
          setTimeout(Browser.mainLoop.runner, timeUntilNextTick); // doing this each time means that on exception, we stop
        };
        Browser.mainLoop.method = 'timeout';
      } else if (mode == 1 /*EM_TIMING_RAF*/) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
          Browser.requestAnimationFrame(Browser.mainLoop.runner);
        };
        Browser.mainLoop.method = 'rAF';
      } else if (mode == 2 /*EM_TIMING_SETIMMEDIATE*/) {
        if (typeof setImmediate === 'undefined') {
          // Emulate setImmediate. (note: not a complete polyfill, we don't emulate clearImmediate() to keep code size to minimum, since not needed)
          var setImmediates = [];
          var emscriptenMainLoopMessageId = 'setimmediate';
          function Browser_setImmediate_messageHandler(event) {
            // When called in current thread or Worker, the main loop ID is structured slightly different to accommodate for --proxy-to-worker runtime listening to Worker events,
            // so check for both cases.
            if (event.data === emscriptenMainLoopMessageId || event.data.target === emscriptenMainLoopMessageId) {
              event.stopPropagation();
              setImmediates.shift()();
            }
          }
          addEventListener("message", Browser_setImmediate_messageHandler, true);
          setImmediate = function Browser_emulated_setImmediate(func) {
            setImmediates.push(func);
            if (ENVIRONMENT_IS_WORKER) {
              if (Module['setImmediates'] === undefined) Module['setImmediates'] = [];
              Module['setImmediates'].push(func);
              postMessage({target: emscriptenMainLoopMessageId}); // In --proxy-to-worker, route the message via proxyClient.js
            } else postMessage(emscriptenMainLoopMessageId, "*"); // On the main thread, can just send the message to itself.
          }
        }
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
          setImmediate(Browser.mainLoop.runner);
        };
        Browser.mainLoop.method = 'immediate';
      }
      return 0;
    }
  
  function _emscripten_get_now() { abort() }function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop, arg, noSetTiming) {
      Module['noExitRuntime'] = true;
  
      assert(!Browser.mainLoop.func, 'emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.');
  
      Browser.mainLoop.func = func;
      Browser.mainLoop.arg = arg;
  
      var browserIterationFunc;
      if (typeof arg !== 'undefined') {
        browserIterationFunc = function() {
          Module['dynCall_vi'](func, arg);
        };
      } else {
        browserIterationFunc = function() {
          Module['dynCall_v'](func);
        };
      }
  
      var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
  
      Browser.mainLoop.runner = function Browser_mainLoop_runner() {
        if (ABORT) return;
        if (Browser.mainLoop.queue.length > 0) {
          var start = Date.now();
          var blocker = Browser.mainLoop.queue.shift();
          blocker.func(blocker.arg);
          if (Browser.mainLoop.remainingBlockers) {
            var remaining = Browser.mainLoop.remainingBlockers;
            var next = remaining%1 == 0 ? remaining-1 : Math.floor(remaining);
            if (blocker.counted) {
              Browser.mainLoop.remainingBlockers = next;
            } else {
              // not counted, but move the progress along a tiny bit
              next = next + 0.5; // do not steal all the next one's progress
              Browser.mainLoop.remainingBlockers = (8*remaining + next)/9;
            }
          }
          console.log('main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + ' ms'); //, left: ' + Browser.mainLoop.remainingBlockers);
          Browser.mainLoop.updateStatus();
  
          // catches pause/resume main loop from blocker execution
          if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  
          setTimeout(Browser.mainLoop.runner, 0);
          return;
        }
  
        // catch pauses from non-main loop sources
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  
        // Implement very basic swap interval control
        Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
        if (Browser.mainLoop.timingMode == 1/*EM_TIMING_RAF*/ && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
          // Not the scheduled time to render this frame - skip.
          Browser.mainLoop.scheduler();
          return;
        } else if (Browser.mainLoop.timingMode == 0/*EM_TIMING_SETTIMEOUT*/) {
          Browser.mainLoop.tickStartTime = _emscripten_get_now();
        }
  
        // Signal GL rendering layer that processing of a new frame is about to start. This helps it optimize
        // VBO double-buffering and reduce GPU stalls.
  
  
  
        if (Browser.mainLoop.method === 'timeout' && Module.ctx) {
          err('Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!');
          Browser.mainLoop.method = ''; // just warn once per call to set main loop
        }
  
        Browser.mainLoop.runIter(browserIterationFunc);
  
  
        // catch pauses from the main loop itself
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  
        // Queue new audio data. This is important to be right after the main loop invocation, so that we will immediately be able
        // to queue the newest produced audio samples.
        // TODO: Consider adding pre- and post- rAF callbacks so that GL.newRenderingFrameStarted() and SDL.audio.queueNewAudioData()
        //       do not need to be hardcoded into this function, but can be more generic.
        if (typeof SDL === 'object' && SDL.audio && SDL.audio.queueNewAudioData) SDL.audio.queueNewAudioData();
  
        Browser.mainLoop.scheduler();
      }
  
      if (!noSetTiming) {
        if (fps && fps > 0) _emscripten_set_main_loop_timing(0/*EM_TIMING_SETTIMEOUT*/, 1000.0 / fps);
        else _emscripten_set_main_loop_timing(1/*EM_TIMING_RAF*/, 1); // Do rAF by rendering each frame (no decimating)
  
        Browser.mainLoop.scheduler();
      }
  
      if (simulateInfiniteLoop) {
        throw 'SimulateInfiniteLoop';
      }
    }var Browser={mainLoop:{scheduler:null,method:"",currentlyRunningMainloop:0,func:null,arg:0,timingMode:0,timingValue:0,currentFrameNumber:0,queue:[],pause:function () {
          Browser.mainLoop.scheduler = null;
          Browser.mainLoop.currentlyRunningMainloop++; // Incrementing this signals the previous main loop that it's now become old, and it must return.
        },resume:function () {
          Browser.mainLoop.currentlyRunningMainloop++;
          var timingMode = Browser.mainLoop.timingMode;
          var timingValue = Browser.mainLoop.timingValue;
          var func = Browser.mainLoop.func;
          Browser.mainLoop.func = null;
          _emscripten_set_main_loop(func, 0, false, Browser.mainLoop.arg, true /* do not set timing and call scheduler, we will do it on the next lines */);
          _emscripten_set_main_loop_timing(timingMode, timingValue);
          Browser.mainLoop.scheduler();
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        },runIter:function (func) {
          if (ABORT) return;
          if (Module['preMainLoop']) {
            var preRet = Module['preMainLoop']();
            if (preRet === false) {
              return; // |return false| skips a frame
            }
          }
          try {
            func();
          } catch (e) {
            if (e instanceof ExitStatus) {
              return;
            } else {
              if (e && typeof e === 'object' && e.stack) err('exception thrown: ' + [e, e.stack]);
              throw e;
            }
          }
          if (Module['postMainLoop']) Module['postMainLoop']();
        }},isFullscreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
  
        // Canvas event setup
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === Module['canvas'] ||
                                document['mozPointerLockElement'] === Module['canvas'] ||
                                document['webkitPointerLockElement'] === Module['canvas'] ||
                                document['msPointerLockElement'] === Module['canvas'];
        }
        var canvas = Module['canvas'];
        if (canvas) {
          // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
          // Module['forcedAspectRatio'] = 4 / 3;
  
          canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                      canvas['mozRequestPointerLock'] ||
                                      canvas['webkitRequestPointerLock'] ||
                                      canvas['msRequestPointerLock'] ||
                                      function(){};
          canvas.exitPointerLock = document['exitPointerLock'] ||
                                   document['mozExitPointerLock'] ||
                                   document['webkitExitPointerLock'] ||
                                   document['msExitPointerLock'] ||
                                   function(){}; // no-op if function does not exist
          canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
          document.addEventListener('pointerlockchange', pointerLockChange, false);
          document.addEventListener('mozpointerlockchange', pointerLockChange, false);
          document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
          document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
          if (Module['elementPointerLock']) {
            canvas.addEventListener("click", function(ev) {
              if (!Browser.pointerLock && Module['canvas'].requestPointerLock) {
                Module['canvas'].requestPointerLock();
                ev.preventDefault();
              }
            }, false);
          }
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx; // no need to recreate GL context if it's already been created for this canvas.
  
        var ctx;
        var contextHandle;
        if (useWebGL) {
          // For GLES2/desktop GL compatibility, adjust a few defaults to be different to WebGL defaults, so that they align better with the desktop defaults.
          var contextAttributes = {
            antialias: false,
            alpha: false
          };
  
          if (webGLContextAttributes) {
            for (var attribute in webGLContextAttributes) {
              contextAttributes[attribute] = webGLContextAttributes[attribute];
            }
          }
  
          contextHandle = GL.createContext(canvas, contextAttributes);
          if (contextHandle) {
            ctx = GL.getContext(contextHandle).GLctx;
          }
        } else {
          ctx = canvas.getContext('2d');
        }
  
        if (!ctx) return null;
  
        if (setInModule) {
          if (!useWebGL) assert(typeof GLctx === 'undefined', 'cannot set in module if GLctx is used, but we are a non-GL context that would replace it');
  
          Module.ctx = ctx;
          if (useWebGL) GL.makeContextCurrent(contextHandle);
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullscreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullscreen:function (lockPointer, resizeCanvas, vrDevice) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        Browser.vrDevice = vrDevice;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        if (typeof Browser.vrDevice === 'undefined') Browser.vrDevice = null;
  
        var canvas = Module['canvas'];
        function fullscreenChange() {
          Browser.isFullscreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['fullscreenElement'] || document['mozFullScreenElement'] ||
               document['msFullscreenElement'] || document['webkitFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.exitFullscreen = document['exitFullscreen'] ||
                                    document['cancelFullScreen'] ||
                                    document['mozCancelFullScreen'] ||
                                    document['msExitFullscreen'] ||
                                    document['webkitCancelFullScreen'] ||
                                    function() {};
            canvas.exitFullscreen = canvas.exitFullscreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullscreen = true;
            if (Browser.resizeCanvas) {
              Browser.setFullscreenCanvasSize();
            } else {
              Browser.updateCanvasDimensions(canvas);
            }
          } else {
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
  
            if (Browser.resizeCanvas) {
              Browser.setWindowedCanvasSize();
            } else {
              Browser.updateCanvasDimensions(canvas);
            }
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullscreen);
          if (Module['onFullscreen']) Module['onFullscreen'](Browser.isFullscreen);
        }
  
        if (!Browser.fullscreenHandlersInstalled) {
          Browser.fullscreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullscreenChange, false);
          document.addEventListener('mozfullscreenchange', fullscreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullscreenChange, false);
          document.addEventListener('MSFullscreenChange', fullscreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
  
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullscreen = canvasContainer['requestFullscreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullscreen'] ? function() { canvasContainer['webkitRequestFullscreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null) ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
  
        if (vrDevice) {
          canvasContainer.requestFullscreen({ vrDisplay: vrDevice });
        } else {
          canvasContainer.requestFullscreen();
        }
      },requestFullScreen:function (lockPointer, resizeCanvas, vrDevice) {
          err('Browser.requestFullScreen() is deprecated. Please call Browser.requestFullscreen instead.');
          Browser.requestFullScreen = function(lockPointer, resizeCanvas, vrDevice) {
            return Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice);
          }
          return Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice);
      },nextRAF:0,fakeRequestAnimationFrame:function (func) {
        // try to keep 60fps between calls to here
        var now = Date.now();
        if (Browser.nextRAF === 0) {
          Browser.nextRAF = now + 1000/60;
        } else {
          while (now + 2 >= Browser.nextRAF) { // fudge a little, to avoid timer jitter causing us to do lots of delay:0
            Browser.nextRAF += 1000/60;
          }
        }
        var delay = Math.max(Browser.nextRAF - now, 0);
        setTimeout(func, delay);
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          Browser.fakeRequestAnimationFrame(func);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           Browser.fakeRequestAnimationFrame;
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },allowAsyncCallbacks:true,queuedAsyncCallbacks:[],pauseAsyncCallbacks:function () {
        Browser.allowAsyncCallbacks = false;
      },resumeAsyncCallbacks:function () { // marks future callbacks as ok to execute, and synchronously runs any remaining ones right now
        Browser.allowAsyncCallbacks = true;
        if (Browser.queuedAsyncCallbacks.length > 0) {
          var callbacks = Browser.queuedAsyncCallbacks;
          Browser.queuedAsyncCallbacks = [];
          callbacks.forEach(function(func) {
            func();
          });
        }
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (ABORT) return;
          if (Browser.allowAsyncCallbacks) {
            func();
          } else {
            Browser.queuedAsyncCallbacks.push(func);
          }
        });
      },safeSetTimeout:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setTimeout(function() {
          if (ABORT) return;
          if (Browser.allowAsyncCallbacks) {
            func();
          } else {
            Browser.queuedAsyncCallbacks.push(func);
          }
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setInterval(function() {
          if (ABORT) return;
          if (Browser.allowAsyncCallbacks) {
            func();
          } // drop it on the floor otherwise, next interval will kick in
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        var delta = 0;
        switch (event.type) {
          case 'DOMMouseScroll':
            delta = event.detail;
            break;
          case 'mousewheel':
            delta = event.wheelDelta;
            break;
          case 'wheel':
            delta = event['deltaY'];
            break;
          default:
            throw 'unrecognized mouse wheel event: ' + event.type;
        }
        return delta;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
  
          // check if SDL is available
          if (typeof SDL != "undefined") {
            Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
            Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
            // just add the mouse delta to the current absolut mouse position
            // FIXME: ideally this should be clamped against the canvas size and zero
            Browser.mouseX += Browser.mouseMovementX;
            Browser.mouseY += Browser.mouseMovementY;
          }
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
  
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
  
          if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
            var touch = event.touch;
            if (touch === undefined) {
              return; // the "touch" property is only defined in SDL
  
            }
            var adjustedX = touch.pageX - (scrollX + rect.left);
            var adjustedY = touch.pageY - (scrollY + rect.top);
  
            adjustedX = adjustedX * (cw / rect.width);
            adjustedY = adjustedY * (ch / rect.height);
  
            var coords = { x: adjustedX, y: adjustedY };
  
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (event.type === 'touchend' || event.type === 'touchmove') {
              var last = Browser.touches[touch.identifier];
              if (!last) last = coords;
              Browser.lastTouches[touch.identifier] = last;
              Browser.touches[touch.identifier] = coords;
            }
            return;
          }
  
          var x = event.pageX - (scrollX + rect.left);
          var y = event.pageY - (scrollY + rect.top);
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        var dep = !noRunDep ? getUniqueRunDependency('al ' + url) : '';
        Module['readAsync'](url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (dep) removeRunDependency(dep);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (dep) addRunDependency(dep);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullscreenCanvasSize:function () {
        // check if SDL is available
        if (typeof SDL != "undefined") {
          var flags = HEAPU32[((SDL.screen)>>2)];
          flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
          HEAP32[((SDL.screen)>>2)]=flags
        }
        Browser.updateCanvasDimensions(Module['canvas']);
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available
        if (typeof SDL != "undefined") {
          var flags = HEAPU32[((SDL.screen)>>2)];
          flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
          HEAP32[((SDL.screen)>>2)]=flags
        }
        Browser.updateCanvasDimensions(Module['canvas']);
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['fullscreenElement'] || document['mozFullScreenElement'] ||
             document['msFullscreenElement'] || document['webkitFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      },wgetRequests:{},nextWgetRequestHandle:0,getNextWgetRequestHandle:function () {
        var handle = Browser.nextWgetRequestHandle;
        Browser.nextWgetRequestHandle++;
        return handle;
      }};

  
  var SYSCALLS={buffers:[null,[],[]],printChar:function (stream, curr) {
        var buffer = SYSCALLS.buffers[stream];
        assert(buffer);
        if (curr === 0 || curr === 10) {
          (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
          buffer.length = 0;
        } else {
          buffer.push(curr);
        }
      },varargs:0,get:function (varargs) {
        SYSCALLS.varargs += 4;
        var ret = HEAP32[(((SYSCALLS.varargs)-(4))>>2)];
        return ret;
      },getStr:function () {
        var ret = Pointer_stringify(SYSCALLS.get());
        return ret;
      },get64:function () {
        var low = SYSCALLS.get(), high = SYSCALLS.get();
        if (low >= 0) assert(high === 0);
        else assert(high === -1);
        return low;
      },getZero:function () {
        assert(SYSCALLS.get() === 0);
      }};function ___syscall140(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // llseek
      var stream = SYSCALLS.getStreamFromFD(), offset_high = SYSCALLS.get(), offset_low = SYSCALLS.get(), result = SYSCALLS.get(), whence = SYSCALLS.get();
      // NOTE: offset_high is unused - Emscripten's off_t is 32-bit
      var offset = offset_low;
      FS.llseek(stream, offset, whence);
      HEAP32[((result)>>2)]=stream.position;
      if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null; // reset readdir state
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  
  function flush_NO_FILESYSTEM() {
      // flush anything remaining in the buffers during shutdown
      var fflush = Module["_fflush"];
      if (fflush) fflush(0);
      var buffers = SYSCALLS.buffers;
      if (buffers[1].length) SYSCALLS.printChar(1, 10);
      if (buffers[2].length) SYSCALLS.printChar(2, 10);
    }function ___syscall146(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // writev
      // hack to support printf in FILESYSTEM=0
      var stream = SYSCALLS.get(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get();
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAP32[(((iov)+(i*8))>>2)];
        var len = HEAP32[(((iov)+(i*8 + 4))>>2)];
        for (var j = 0; j < len; j++) {
          SYSCALLS.printChar(stream, HEAPU8[ptr+j]);
        }
        ret += len;
      }
      return ret;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall54(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // ioctl
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall6(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // close
      var stream = SYSCALLS.getStreamFromFD();
      FS.close(stream);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function _emscripten_is_main_browser_thread() {
      return !ENVIRONMENT_IS_WORKER;
    }

  
  var Fetch={attr_t_offset_requestMethod:0,attr_t_offset_userData:32,attr_t_offset_onsuccess:36,attr_t_offset_onerror:40,attr_t_offset_onprogress:44,attr_t_offset_attributes:48,attr_t_offset_timeoutMSecs:52,attr_t_offset_withCredentials:56,attr_t_offset_destinationPath:60,attr_t_offset_userName:64,attr_t_offset_password:68,attr_t_offset_requestHeaders:72,attr_t_offset_overriddenMimeType:76,attr_t_offset_requestData:80,attr_t_offset_requestDataSize:84,fetch_t_offset_id:0,fetch_t_offset_userData:4,fetch_t_offset_url:8,fetch_t_offset_data:12,fetch_t_offset_numBytes:16,fetch_t_offset_dataOffset:24,fetch_t_offset_totalBytes:32,fetch_t_offset_readyState:40,fetch_t_offset_status:42,fetch_t_offset_statusText:44,fetch_t_offset___proxyState:108,fetch_t_offset___attributes:112,xhrs:[],worker:undefined,dbInstance:undefined,setu64:function (addr, val) {
      HEAPU32[addr >> 2] = val;
      HEAPU32[addr + 4 >> 2] = (val / 4294967296)|0;
    },openDatabase:function (dbname, dbversion, onsuccess, onerror) {
      try {
        var openRequest = indexedDB.open(dbname, dbversion);
      } catch (e) { return onerror(e); }
  
      openRequest.onupgradeneeded = function(event) {
        var db = event.target.result;
        if (db.objectStoreNames.contains('FILES')) {
          db.deleteObjectStore('FILES');
        }
        db.createObjectStore('FILES');
      };
      openRequest.onsuccess = function(event) { onsuccess(event.target.result); };
      openRequest.onerror = function(error) { onerror(error); };
    },initFetchWorker:function () {
      var stackSize = 128*1024;
      var stack = allocate(stackSize>>2, "i32*", ALLOC_DYNAMIC);
      Fetch.worker.postMessage({cmd: 'init', TOTAL_MEMORY: TOTAL_MEMORY, DYNAMICTOP_PTR: DYNAMICTOP_PTR, STACKTOP: stack, STACK_MAX: stack + stackSize, queuePtr: _fetch_work_queue, buffer: HEAPU8.buffer});
    },staticInit:function () {
      var isMainThread = (typeof ENVIRONMENT_IS_FETCH_WORKER === 'undefined');
  
      var onsuccess = function(db) {
        Fetch.dbInstance = db;
  
        if (isMainThread) {
          removeRunDependency('library_fetch_init');
        }
      };
      var onerror = function() {
        Fetch.dbInstance = false;
  
        if (isMainThread) {
          removeRunDependency('library_fetch_init');
        }
      };
      Fetch.openDatabase('emscripten_filesystem', 1, onsuccess, onerror);
  
      if (typeof ENVIRONMENT_IS_FETCH_WORKER === 'undefined' || !ENVIRONMENT_IS_FETCH_WORKER) addRunDependency('library_fetch_init');
    }};
  
  function __emscripten_fetch_xhr(fetch, onsuccess, onerror, onprogress) {
    var url = HEAPU32[fetch + Fetch.fetch_t_offset_url >> 2];
    if (!url) {
      onerror(fetch, 0, 'no url specified!');
      return;
    }
    var url_ = Pointer_stringify(url);
  
    var fetch_attr = fetch + Fetch.fetch_t_offset___attributes;
    var requestMethod = Pointer_stringify(fetch_attr);
    if (!requestMethod) requestMethod = 'GET';
    var userData = HEAPU32[fetch_attr + Fetch.attr_t_offset_userData >> 2];
    var fetchAttributes = HEAPU32[fetch_attr + Fetch.attr_t_offset_attributes >> 2];
    var timeoutMsecs = HEAPU32[fetch_attr + Fetch.attr_t_offset_timeoutMSecs >> 2];
    var withCredentials = !!HEAPU32[fetch_attr + Fetch.attr_t_offset_withCredentials >> 2];
    var destinationPath = HEAPU32[fetch_attr + Fetch.attr_t_offset_destinationPath >> 2];
    var userName = HEAPU32[fetch_attr + Fetch.attr_t_offset_userName >> 2];
    var password = HEAPU32[fetch_attr + Fetch.attr_t_offset_password >> 2];
    var requestHeaders = HEAPU32[fetch_attr + Fetch.attr_t_offset_requestHeaders >> 2];
    var overriddenMimeType = HEAPU32[fetch_attr + Fetch.attr_t_offset_overriddenMimeType >> 2];
    var dataPtr = HEAPU32[fetch_attr + Fetch.attr_t_offset_requestData >> 2];
    var dataLength = HEAPU32[fetch_attr + Fetch.attr_t_offset_requestDataSize >> 2];
  
    var fetchAttrLoadToMemory = !!(fetchAttributes & 1/*EMSCRIPTEN_FETCH_LOAD_TO_MEMORY*/);
    var fetchAttrStreamData = !!(fetchAttributes & 2/*EMSCRIPTEN_FETCH_STREAM_DATA*/);
    var fetchAttrPersistFile = !!(fetchAttributes & 4/*EMSCRIPTEN_FETCH_PERSIST_FILE*/);
    var fetchAttrAppend = !!(fetchAttributes & 8/*EMSCRIPTEN_FETCH_APPEND*/);
    var fetchAttrReplace = !!(fetchAttributes & 16/*EMSCRIPTEN_FETCH_REPLACE*/);
    var fetchAttrNoDownload = !!(fetchAttributes & 32/*EMSCRIPTEN_FETCH_NO_DOWNLOAD*/);
    var fetchAttrSynchronous = !!(fetchAttributes & 64/*EMSCRIPTEN_FETCH_SYNCHRONOUS*/);
    var fetchAttrWaitable = !!(fetchAttributes & 128/*EMSCRIPTEN_FETCH_WAITABLE*/);
  
    var userNameStr = userName ? Pointer_stringify(userName) : undefined;
    var passwordStr = password ? Pointer_stringify(password) : undefined;
    var overriddenMimeTypeStr = overriddenMimeType ? Pointer_stringify(overriddenMimeType) : undefined;
  
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = withCredentials;
    xhr.open(requestMethod, url_, !fetchAttrSynchronous, userNameStr, passwordStr);
    if (!fetchAttrSynchronous) xhr.timeout = timeoutMsecs; // XHR timeout field is only accessible in async XHRs, and must be set after .open() but before .send().
    xhr.url_ = url_; // Save the url for debugging purposes (and for comparing to the responseURL that server side advertised)
    xhr.responseType = fetchAttrStreamData ? 'moz-chunked-arraybuffer' : 'arraybuffer';
  
    if (overriddenMimeType) {
      xhr.overrideMimeType(overriddenMimeTypeStr);
    }
    if (requestHeaders) {
      for(;;) {
        var key = HEAPU32[requestHeaders >> 2];
        if (!key) break;
        var value = HEAPU32[requestHeaders + 4 >> 2];
        if (!value) break;
        requestHeaders += 8;
        var keyStr = Pointer_stringify(key);
        var valueStr = Pointer_stringify(value);
        xhr.setRequestHeader(keyStr, valueStr);
      }
    }
    Fetch.xhrs.push(xhr);
    var id = Fetch.xhrs.length;
    HEAPU32[fetch + Fetch.fetch_t_offset_id >> 2] = id;
    var data = (dataPtr && dataLength) ? HEAPU8.slice(dataPtr, dataPtr + dataLength) : null;
    // TODO: Support specifying custom headers to the request.
  
    xhr.onload = function(e) {
      var len = xhr.response ? xhr.response.byteLength : 0;
      var ptr = 0;
      var ptrLen = 0;
      if (fetchAttrLoadToMemory && !fetchAttrStreamData) {
        ptrLen = len;
        // The data pointer malloc()ed here has the same lifetime as the emscripten_fetch_t structure itself has, and is
        // freed when emscripten_fetch_close() is called.
        ptr = _malloc(ptrLen);
        HEAPU8.set(new Uint8Array(xhr.response), ptr);
      }
      HEAPU32[fetch + Fetch.fetch_t_offset_data >> 2] = ptr;
      Fetch.setu64(fetch + Fetch.fetch_t_offset_numBytes, ptrLen);
      Fetch.setu64(fetch + Fetch.fetch_t_offset_dataOffset, 0);
      if (len) {
        // If the final XHR.onload handler receives the bytedata to compute total length, report that,
        // otherwise don't write anything out here, which will retain the latest byte size reported in
        // the most recent XHR.onprogress handler.
        Fetch.setu64(fetch + Fetch.fetch_t_offset_totalBytes, len);
      }
      HEAPU16[fetch + Fetch.fetch_t_offset_readyState >> 1] = xhr.readyState;
      if (xhr.readyState === 4 && xhr.status === 0) {
        if (len > 0) xhr.status = 200; // If loading files from a source that does not give HTTP status code, assume success if we got data bytes.
        else xhr.status = 404; // Conversely, no data bytes is 404.
      }
      HEAPU16[fetch + Fetch.fetch_t_offset_status >> 1] = xhr.status;
      if (xhr.statusText) stringToUTF8(xhr.statusText, fetch + Fetch.fetch_t_offset_statusText, 64);
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onsuccess) onsuccess(fetch, xhr, e);
      } else {
        if (onerror) onerror(fetch, xhr, e);
      }
    }
    xhr.onerror = function(e) {
      var status = xhr.status; // XXX TODO: Overwriting xhr.status doesn't work here, so don't override anywhere else either.
      if (xhr.readyState == 4 && status == 0) status = 404; // If no error recorded, pretend it was 404 Not Found.
      HEAPU32[fetch + Fetch.fetch_t_offset_data >> 2] = 0;
      Fetch.setu64(fetch + Fetch.fetch_t_offset_numBytes, 0);
      Fetch.setu64(fetch + Fetch.fetch_t_offset_dataOffset, 0);
      Fetch.setu64(fetch + Fetch.fetch_t_offset_totalBytes, 0);
      HEAPU16[fetch + Fetch.fetch_t_offset_readyState >> 1] = xhr.readyState;
      HEAPU16[fetch + Fetch.fetch_t_offset_status >> 1] = status;
      if (onerror) onerror(fetch, xhr, e);
    }
    xhr.ontimeout = function(e) {
      if (onerror) onerror(fetch, xhr, e);
    }
    xhr.onprogress = function(e) {
      var ptrLen = (fetchAttrLoadToMemory && fetchAttrStreamData && xhr.response) ? xhr.response.byteLength : 0;
      var ptr = 0;
      if (fetchAttrLoadToMemory && fetchAttrStreamData) {
        // The data pointer malloc()ed here has the same lifetime as the emscripten_fetch_t structure itself has, and is
        // freed when emscripten_fetch_close() is called.
        ptr = _malloc(ptrLen);
        HEAPU8.set(new Uint8Array(xhr.response), ptr);
      }
      HEAPU32[fetch + Fetch.fetch_t_offset_data >> 2] = ptr;
      Fetch.setu64(fetch + Fetch.fetch_t_offset_numBytes, ptrLen);
      Fetch.setu64(fetch + Fetch.fetch_t_offset_dataOffset, e.loaded - ptrLen);
      Fetch.setu64(fetch + Fetch.fetch_t_offset_totalBytes, e.total);
      HEAPU16[fetch + Fetch.fetch_t_offset_readyState >> 1] = xhr.readyState;
      if (xhr.readyState >= 3 && xhr.status === 0 && e.loaded > 0) xhr.status = 200; // If loading files from a source that does not give HTTP status code, assume success if we get data bytes
      HEAPU16[fetch + Fetch.fetch_t_offset_status >> 1] = xhr.status;
      if (xhr.statusText) stringToUTF8(xhr.statusText, fetch + Fetch.fetch_t_offset_statusText, 64);
      if (onprogress) onprogress(fetch, xhr, e);
    }
    try {
      xhr.send(data);
    } catch(e) {
      if (onerror) onerror(fetch, xhr, e);
    }
  }
  
  function __emscripten_fetch_cache_data(db, fetch, data, onsuccess, onerror) {
    if (!db) {
      onerror(fetch, 0, 'IndexedDB not available!');
      return;
    }
  
    var fetch_attr = fetch + Fetch.fetch_t_offset___attributes;
    var destinationPath = HEAPU32[fetch_attr + Fetch.attr_t_offset_destinationPath >> 2];
    if (!destinationPath) destinationPath = HEAPU32[fetch + Fetch.fetch_t_offset_url >> 2];
    var destinationPathStr = Pointer_stringify(destinationPath);
  
    try {
      var transaction = db.transaction(['FILES'], 'readwrite');
      var packages = transaction.objectStore('FILES');
      var putRequest = packages.put(data, destinationPathStr);
      putRequest.onsuccess = function(event) {
        HEAPU16[fetch + Fetch.fetch_t_offset_readyState >> 1] = 4; // Mimic XHR readyState 4 === 'DONE: The operation is complete'
        HEAPU16[fetch + Fetch.fetch_t_offset_status >> 1] = 200; // Mimic XHR HTTP status code 200 "OK"
        stringToUTF8("OK", fetch + Fetch.fetch_t_offset_statusText, 64);
        onsuccess(fetch, 0, destinationPathStr);
      };
      putRequest.onerror = function(error) {
        // Most likely we got an error if IndexedDB is unwilling to store any more data for this page.
        // TODO: Can we identify and break down different IndexedDB-provided errors and convert those
        // to more HTTP status codes for more information?
        HEAPU16[fetch + Fetch.fetch_t_offset_readyState >> 1] = 4; // Mimic XHR readyState 4 === 'DONE: The operation is complete'
        HEAPU16[fetch + Fetch.fetch_t_offset_status >> 1] = 413; // Mimic XHR HTTP status code 413 "Payload Too Large"
        stringToUTF8("Payload Too Large", fetch + Fetch.fetch_t_offset_statusText, 64);
        onerror(fetch, 0, error);
      };
    } catch(e) {
      onerror(fetch, 0, e);
    }
  }
  
  function __emscripten_fetch_load_cached_data(db, fetch, onsuccess, onerror) {
    if (!db) {
      onerror(fetch, 0, 'IndexedDB not available!');
      return;
    }
  
    var fetch_attr = fetch + Fetch.fetch_t_offset___attributes;
    var path = HEAPU32[fetch_attr + Fetch.attr_t_offset_destinationPath >> 2];
    if (!path) path = HEAPU32[fetch + Fetch.fetch_t_offset_url >> 2];
    var pathStr = Pointer_stringify(path);
  
    try {
      var transaction = db.transaction(['FILES'], 'readonly');
      var packages = transaction.objectStore('FILES');
      var getRequest = packages.get(pathStr);
      getRequest.onsuccess = function(event) {
        if (event.target.result) {
          var value = event.target.result;
          var len = value.byteLength || value.length;
  
          // The data pointer malloc()ed here has the same lifetime as the emscripten_fetch_t structure itself has, and is
          // freed when emscripten_fetch_close() is called.
          var ptr = _malloc(len);
          HEAPU8.set(new Uint8Array(value), ptr);
          HEAPU32[fetch + Fetch.fetch_t_offset_data >> 2] = ptr;
          Fetch.setu64(fetch + Fetch.fetch_t_offset_numBytes, len);
          Fetch.setu64(fetch + Fetch.fetch_t_offset_dataOffset, 0);
          Fetch.setu64(fetch + Fetch.fetch_t_offset_totalBytes, len);
          HEAPU16[fetch + Fetch.fetch_t_offset_readyState >> 1] = 4; // Mimic XHR readyState 4 === 'DONE: The operation is complete'
          HEAPU16[fetch + Fetch.fetch_t_offset_status >> 1] = 200; // Mimic XHR HTTP status code 200 "OK"
          stringToUTF8("OK", fetch + Fetch.fetch_t_offset_statusText, 64);
          onsuccess(fetch, 0, value);
        } else {
          // Succeeded to load, but the load came back with the value of undefined, treat that as an error since we never store undefined in db.
          HEAPU16[fetch + Fetch.fetch_t_offset_readyState >> 1] = 4; // Mimic XHR readyState 4 === 'DONE: The operation is complete'
          HEAPU16[fetch + Fetch.fetch_t_offset_status >> 1] = 404; // Mimic XHR HTTP status code 404 "Not Found"
          stringToUTF8("Not Found", fetch + Fetch.fetch_t_offset_statusText, 64);
          onerror(fetch, 0, 'no data');
        }
      };
      getRequest.onerror = function(error) {
        HEAPU16[fetch + Fetch.fetch_t_offset_readyState >> 1] = 4; // Mimic XHR readyState 4 === 'DONE: The operation is complete'
        HEAPU16[fetch + Fetch.fetch_t_offset_status >> 1] = 404; // Mimic XHR HTTP status code 404 "Not Found"
        stringToUTF8("Not Found", fetch + Fetch.fetch_t_offset_statusText, 64);
        onerror(fetch, 0, error);
      };
    } catch(e) {
      onerror(fetch, 0, e);
    }
  }
  
  function __emscripten_fetch_delete_cached_data(db, fetch, onsuccess, onerror) {
    if (!db) {
      onerror(fetch, 0, 'IndexedDB not available!');
      return;
    }
  
    var fetch_attr = fetch + Fetch.fetch_t_offset___attributes;
    var path = HEAPU32[fetch_attr + Fetch.attr_t_offset_destinationPath >> 2];
    if (!path) path = HEAPU32[fetch + Fetch.fetch_t_offset_url >> 2];
    var pathStr = Pointer_stringify(path);
  
    try {
      var transaction = db.transaction(['FILES'], 'readwrite');
      var packages = transaction.objectStore('FILES');
      var request = packages.delete(pathStr);
      request.onsuccess = function(event) {
        var value = event.target.result;
        HEAPU32[fetch + Fetch.fetch_t_offset_data >> 2] = 0;
        Fetch.setu64(fetch + Fetch.fetch_t_offset_numBytes, 0);
        Fetch.setu64(fetch + Fetch.fetch_t_offset_dataOffset, 0);
        Fetch.setu64(fetch + Fetch.fetch_t_offset_dataOffset, 0);
        HEAPU16[fetch + Fetch.fetch_t_offset_readyState >> 1] = 4; // Mimic XHR readyState 4 === 'DONE: The operation is complete'
        HEAPU16[fetch + Fetch.fetch_t_offset_status >> 1] = 200; // Mimic XHR HTTP status code 200 "OK"
        stringToUTF8("OK", fetch + Fetch.fetch_t_offset_statusText, 64);
        onsuccess(fetch, 0, value);
      };
      request.onerror = function(error) {
        HEAPU16[fetch + Fetch.fetch_t_offset_readyState >> 1] = 4; // Mimic XHR readyState 4 === 'DONE: The operation is complete'
        HEAPU16[fetch + Fetch.fetch_t_offset_status >> 1] = 404; // Mimic XHR HTTP status code 404 "Not Found"
        stringToUTF8("Not Found", fetch + Fetch.fetch_t_offset_statusText, 64);
        onerror(fetch, 0, error);
      };
    } catch(e) {
      onerror(fetch, 0, e);
    }
  }
  
  
  var _fetch_work_queue=allocate(12, "i32*", ALLOC_STATIC);function __emscripten_get_fetch_work_queue() {
      return _fetch_work_queue;
    }
  
  function _emscripten_is_main_runtime_thread() {
      return 1;
    }function _emscripten_start_fetch(fetch, successcb, errorcb, progresscb) {
    if (typeof Module !== 'undefined') Module['noExitRuntime'] = true; // If we are the main Emscripten runtime, we should not be closing down.
  
    var fetch_attr = fetch + Fetch.fetch_t_offset___attributes;
    var requestMethod = Pointer_stringify(fetch_attr);
    var onsuccess = HEAPU32[fetch_attr + Fetch.attr_t_offset_onsuccess >> 2];
    var onerror = HEAPU32[fetch_attr + Fetch.attr_t_offset_onerror >> 2];
    var onprogress = HEAPU32[fetch_attr + Fetch.attr_t_offset_onprogress >> 2];
    var fetchAttributes = HEAPU32[fetch_attr + Fetch.attr_t_offset_attributes >> 2];
    var fetchAttrLoadToMemory = !!(fetchAttributes & 1/*EMSCRIPTEN_FETCH_LOAD_TO_MEMORY*/);
    var fetchAttrStreamData = !!(fetchAttributes & 2/*EMSCRIPTEN_FETCH_STREAM_DATA*/);
    var fetchAttrPersistFile = !!(fetchAttributes & 4/*EMSCRIPTEN_FETCH_PERSIST_FILE*/);
    var fetchAttrAppend = !!(fetchAttributes & 8/*EMSCRIPTEN_FETCH_APPEND*/);
    var fetchAttrReplace = !!(fetchAttributes & 16/*EMSCRIPTEN_FETCH_REPLACE*/);
    var fetchAttrNoDownload = !!(fetchAttributes & 32/*EMSCRIPTEN_FETCH_NO_DOWNLOAD*/);
  
    var reportSuccess = function(fetch, xhr, e) {
      if (onsuccess && typeof dynCall === 'function') Module['dynCall_vi'](onsuccess, fetch);
      else if (successcb) successcb(fetch);
    };
  
    var cacheResultAndReportSuccess = function(fetch, xhr, e) {
      var storeSuccess = function(fetch, xhr, e) {
        if (onsuccess && typeof dynCall === 'function') Module['dynCall_vi'](onsuccess, fetch);
        else if (successcb) successcb(fetch);
      };
      var storeError = function(fetch, xhr, e) {
        if (onsuccess && typeof dynCall === 'function') Module['dynCall_vi'](onsuccess, fetch);
        else if (successcb) successcb(fetch);
      };
      __emscripten_fetch_cache_data(Fetch.dbInstance, fetch, xhr.response, storeSuccess, storeError);
    };
  
    var reportProgress = function(fetch, xhr, e) {
      if (onprogress && typeof dynCall === 'function') Module['dynCall_vi'](onprogress, fetch);
      else if (progresscb) progresscb(fetch);
    };
  
    var reportError = function(fetch, xhr, e) {
      if (onerror && typeof dynCall === 'function') Module['dynCall_vi'](onerror, fetch);
      else if (errorcb) errorcb(fetch);
    };
  
    var performUncachedXhr = function(fetch, xhr, e) {
      __emscripten_fetch_xhr(fetch, reportSuccess, reportError, reportProgress);
    };
  
    var performCachedXhr = function(fetch, xhr, e) {
      __emscripten_fetch_xhr(fetch, cacheResultAndReportSuccess, reportError, reportProgress);
    };
  
    // Should we try IndexedDB first?
    if (!fetchAttrReplace || requestMethod === 'EM_IDB_STORE' || requestMethod === 'EM_IDB_DELETE') {
      if (!Fetch.dbInstance) {
        reportError(fetch, 0, 'IndexedDB is not open');
        return 0; // todo: free
      }
  
      if (requestMethod === 'EM_IDB_STORE') {
        var dataPtr = HEAPU32[fetch_attr + Fetch.attr_t_offset_requestData >> 2];
        var dataLength = HEAPU32[fetch_attr + Fetch.attr_t_offset_requestDataSize >> 2];
        var data = HEAPU8.slice(dataPtr, dataPtr + dataLength); // TODO(?): Here we perform a clone of the data, because storing shared typed arrays to IndexedDB does not seem to be allowed.
        __emscripten_fetch_cache_data(Fetch.dbInstance, fetch, data, reportSuccess, reportError);
      } else if (requestMethod === 'EM_IDB_DELETE') {
        __emscripten_fetch_delete_cached_data(Fetch.dbInstance, fetch, reportSuccess, reportError);
      } else if (fetchAttrNoDownload) {
        __emscripten_fetch_load_cached_data(Fetch.dbInstance, fetch, reportSuccess, reportError);
      } else if (fetchAttrPersistFile) {
        __emscripten_fetch_load_cached_data(Fetch.dbInstance, fetch, reportSuccess, performCachedXhr);
      } else {
        __emscripten_fetch_load_cached_data(Fetch.dbInstance, fetch, reportSuccess, performUncachedXhr);
      }
    } else if (!fetchAttrNoDownload) {
      if (fetchAttrPersistFile) {
        __emscripten_fetch_xhr(fetch, cacheResultAndReportSuccess, reportError, reportProgress);
      } else {
        __emscripten_fetch_xhr(fetch, reportSuccess, reportError, reportProgress);
      }
    } else {
      return 0; // todo: free
    }
    return fetch;
  }

   

  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 

   

  
  function ___setErrNo(value) {
      if (Module['___errno_location']) HEAP32[((Module['___errno_location']())>>2)]=value;
      return value;
    } 
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas, vrDevice) { err("Module.requestFullScreen is deprecated. Please call Module.requestFullscreen instead."); Module["requestFullScreen"] = Module["requestFullscreen"]; Browser.requestFullScreen(lockPointer, resizeCanvas, vrDevice) };
  Module["requestFullscreen"] = function Module_requestFullscreen(lockPointer, resizeCanvas, vrDevice) { Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
  Module["createContext"] = function Module_createContext(canvas, useWebGL, setInModule, webGLContextAttributes) { return Browser.createContext(canvas, useWebGL, setInModule, webGLContextAttributes) };
if (ENVIRONMENT_IS_NODE) {
    _emscripten_get_now = function _emscripten_get_now_actual() {
      var t = process['hrtime']();
      return t[0] * 1e3 + t[1] / 1e6;
    };
  } else if (typeof dateNow !== 'undefined') {
    _emscripten_get_now = dateNow;
  } else if (typeof self === 'object' && self['performance'] && typeof self['performance']['now'] === 'function') {
    _emscripten_get_now = function() { return self['performance']['now'](); };
  } else if (typeof performance === 'object' && typeof performance['now'] === 'function') {
    _emscripten_get_now = function() { return performance['now'](); };
  } else {
    _emscripten_get_now = Date.now;
  };
Fetch.staticInit();;
DYNAMICTOP_PTR = staticAlloc(4);

STACK_BASE = STACKTOP = alignMemory(STATICTOP);

STACK_MAX = STACK_BASE + TOTAL_STACK;

DYNAMIC_BASE = alignMemory(STACK_MAX);

HEAP32[DYNAMICTOP_PTR>>2] = DYNAMIC_BASE;

staticSealed = true; // seal the static portion of memory

var ASSERTIONS = false;

// Copyright 2017 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

/** @type {function(string, boolean=, number=)} */
function intArrayFromString(stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
}

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      if (ASSERTIONS) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      }
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}



Module['wasmTableSize'] = 26;

Module['wasmMaxTableSize'] = 26;

Module.asmGlobalArg = {};

Module.asmLibraryArg = { "abort": abort, "assert": assert, "enlargeMemory": enlargeMemory, "getTotalMemory": getTotalMemory, "setTempRet0": setTempRet0, "getTempRet0": getTempRet0, "abortOnCannotGrowMemory": abortOnCannotGrowMemory, "_Alert_InfuraResponse": _Alert_InfuraResponse, "_ERROR": _ERROR, "_SetupLocalStorage": _SetupLocalStorage, "___setErrNo": ___setErrNo, "___syscall140": ___syscall140, "___syscall146": ___syscall146, "___syscall54": ___syscall54, "___syscall6": ___syscall6, "__emscripten_fetch_cache_data": __emscripten_fetch_cache_data, "__emscripten_fetch_delete_cached_data": __emscripten_fetch_delete_cached_data, "__emscripten_fetch_load_cached_data": __emscripten_fetch_load_cached_data, "__emscripten_fetch_xhr": __emscripten_fetch_xhr, "__emscripten_get_fetch_work_queue": __emscripten_get_fetch_work_queue, "_alert": _alert, "_emscripten_get_now": _emscripten_get_now, "_emscripten_is_main_browser_thread": _emscripten_is_main_browser_thread, "_emscripten_is_main_runtime_thread": _emscripten_is_main_runtime_thread, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_emscripten_set_main_loop": _emscripten_set_main_loop, "_emscripten_set_main_loop_timing": _emscripten_set_main_loop_timing, "_emscripten_start_fetch": _emscripten_start_fetch, "_generateSignedTransaction": _generateSignedTransaction, "_getAddress": _getAddress, "_getElementById": _getElementById, "_getLoginName": _getLoginName, "_retrievePrice": _retrievePrice, "_setBalance": _setBalance, "_setName": _setName, "flush_NO_FILESYSTEM": flush_NO_FILESYSTEM, "DYNAMICTOP_PTR": DYNAMICTOP_PTR, "tempDoublePtr": tempDoublePtr, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX };
// EMSCRIPTEN_START_ASM
var asm =Module["asm"]// EMSCRIPTEN_END_ASM
(Module.asmGlobalArg, Module.asmLibraryArg, buffer);

Module["asm"] = asm;
var _ETHToUSD = Module["_ETHToUSD"] = function() {  return Module["asm"]["_ETHToUSD"].apply(null, arguments) };
var _USDToETH = Module["_USDToETH"] = function() {  return Module["asm"]["_USDToETH"].apply(null, arguments) };
var _USERVER_NEW = Module["_USERVER_NEW"] = function() {  return Module["asm"]["_USERVER_NEW"].apply(null, arguments) };
var _USERVER_SetupMetadata = Module["_USERVER_SetupMetadata"] = function() {  return Module["asm"]["_USERVER_SetupMetadata"].apply(null, arguments) };
var ___em_js__Alert_InfuraResponse = Module["___em_js__Alert_InfuraResponse"] = function() {  return Module["asm"]["___em_js__Alert_InfuraResponse"].apply(null, arguments) };
var ___em_js__ERROR = Module["___em_js__ERROR"] = function() {  return Module["asm"]["___em_js__ERROR"].apply(null, arguments) };
var ___em_js__SetupLocalStorage = Module["___em_js__SetupLocalStorage"] = function() {  return Module["asm"]["___em_js__SetupLocalStorage"].apply(null, arguments) };
var ___em_js__alert = Module["___em_js__alert"] = function() {  return Module["asm"]["___em_js__alert"].apply(null, arguments) };
var ___em_js__generateSignedTransaction = Module["___em_js__generateSignedTransaction"] = function() {  return Module["asm"]["___em_js__generateSignedTransaction"].apply(null, arguments) };
var ___em_js__getAddress = Module["___em_js__getAddress"] = function() {  return Module["asm"]["___em_js__getAddress"].apply(null, arguments) };
var ___em_js__getElementById = Module["___em_js__getElementById"] = function() {  return Module["asm"]["___em_js__getElementById"].apply(null, arguments) };
var ___em_js__getLoginName = Module["___em_js__getLoginName"] = function() {  return Module["asm"]["___em_js__getLoginName"].apply(null, arguments) };
var ___em_js__retrievePrice = Module["___em_js__retrievePrice"] = function() {  return Module["asm"]["___em_js__retrievePrice"].apply(null, arguments) };
var ___em_js__setBalance = Module["___em_js__setBalance"] = function() {  return Module["asm"]["___em_js__setBalance"].apply(null, arguments) };
var ___em_js__setName = Module["___em_js__setName"] = function() {  return Module["asm"]["___em_js__setName"].apply(null, arguments) };
var ___errno_location = Module["___errno_location"] = function() {  return Module["asm"]["___errno_location"].apply(null, arguments) };
var _executeNormalTx = Module["_executeNormalTx"] = function() {  return Module["asm"]["_executeNormalTx"].apply(null, arguments) };
var _free = Module["_free"] = function() {  return Module["asm"]["_free"].apply(null, arguments) };
var _llvm_bswap_i32 = Module["_llvm_bswap_i32"] = function() {  return Module["asm"]["_llvm_bswap_i32"].apply(null, arguments) };
var _main = Module["_main"] = function() {  return Module["asm"]["_main"].apply(null, arguments) };
var _malloc = Module["_malloc"] = function() {  return Module["asm"]["_malloc"].apply(null, arguments) };
var _memcpy = Module["_memcpy"] = function() {  return Module["asm"]["_memcpy"].apply(null, arguments) };
var _memset = Module["_memset"] = function() {  return Module["asm"]["_memset"].apply(null, arguments) };
var _sbrk = Module["_sbrk"] = function() {  return Module["asm"]["_sbrk"].apply(null, arguments) };
var _setupBalance = Module["_setupBalance"] = function() {  return Module["asm"]["_setupBalance"].apply(null, arguments) };
var establishStackSpace = Module["establishStackSpace"] = function() {  return Module["asm"]["establishStackSpace"].apply(null, arguments) };
var setThrew = Module["setThrew"] = function() {  return Module["asm"]["setThrew"].apply(null, arguments) };
var stackAlloc = Module["stackAlloc"] = function() {  return Module["asm"]["stackAlloc"].apply(null, arguments) };
var stackRestore = Module["stackRestore"] = function() {  return Module["asm"]["stackRestore"].apply(null, arguments) };
var stackSave = Module["stackSave"] = function() {  return Module["asm"]["stackSave"].apply(null, arguments) };
var dynCall_ii = Module["dynCall_ii"] = function() {  return Module["asm"]["dynCall_ii"].apply(null, arguments) };
var dynCall_iiii = Module["dynCall_iiii"] = function() {  return Module["asm"]["dynCall_iiii"].apply(null, arguments) };
var dynCall_vi = Module["dynCall_vi"] = function() {  return Module["asm"]["dynCall_vi"].apply(null, arguments) };
;


if (ENVIRONMENT_IS_WORKER) {

// Copyright 2014 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

// WebGLWorker worker code

function WebGLBuffer(id) {
  this.what = 'buffer';
  this.id = id;
}
function WebGLProgram(id) {
  this.what = 'program';
  this.id = id;
  this.shaders = [];
  this.attributes = {};
  this.attributeVec = [];
  this.nextAttributes = {};
  this.nextAttributeVec = [];
}
function WebGLFramebuffer(id) {
  this.what = 'frameBuffer';
  this.id = id;
}
function WebGLRenderbuffer(id) {
  this.what = 'renderBuffer';
  this.id = id;
}
function WebGLTexture(id) {
  this.what = 'texture';
  this.id = id;
  this.binding = 0;
}

function WebGLWorker() {
  //===========
  // Constants
  //===========

  /* ClearBufferMask */
  this.DEPTH_BUFFER_BIT               = 0x00000100;
  this.STENCIL_BUFFER_BIT             = 0x00000400;
  this.COLOR_BUFFER_BIT               = 0x00004000;
  
  /* BeginMode */
  this.POINTS                         = 0x0000;
  this.LINES                          = 0x0001;
  this.LINE_LOOP                      = 0x0002;
  this.LINE_STRIP                     = 0x0003;
  this.TRIANGLES                      = 0x0004;
  this.TRIANGLE_STRIP                 = 0x0005;
  this.TRIANGLE_FAN                   = 0x0006;
  
  /* AlphaFunction (not supported in ES20) */
  /*      NEVER */
  /*      LESS */
  /*      EQUAL */
  /*      LEQUAL */
  /*      GREATER */
  /*      NOTEQUAL */
  /*      GEQUAL */
  /*      ALWAYS */
  
  /* BlendingFactorDest */
  this.ZERO                           = 0;
  this.ONE                            = 1;
  this.SRC_COLOR                      = 0x0300;
  this.ONE_MINUS_SRC_COLOR            = 0x0301;
  this.SRC_ALPHA                      = 0x0302;
  this.ONE_MINUS_SRC_ALPHA            = 0x0303;
  this.DST_ALPHA                      = 0x0304;
  this.ONE_MINUS_DST_ALPHA            = 0x0305;
  
  /* BlendingFactorSrc */
  /*      ZERO */
  /*      ONE */
  this.DST_COLOR                      = 0x0306;
  this.ONE_MINUS_DST_COLOR            = 0x0307;
  this.SRC_ALPHA_SATURATE             = 0x0308;
  /*      SRC_ALPHA */
  /*      ONE_MINUS_SRC_ALPHA */
  /*      DST_ALPHA */
  /*      ONE_MINUS_DST_ALPHA */
  
  /* BlendEquationSeparate */
  this.FUNC_ADD                       = 0x8006;
  this.BLEND_EQUATION                 = 0x8009;
  this.BLEND_EQUATION_RGB             = 0x8009;   /* same as BLEND_EQUATION */
  this.BLEND_EQUATION_ALPHA           = 0x883D;
  
  /* BlendSubtract */
  this.FUNC_SUBTRACT                  = 0x800A;
  this.FUNC_REVERSE_SUBTRACT          = 0x800B;
  
  /* Separate Blend Functions */
  this.BLEND_DST_RGB                  = 0x80C8;
  this.BLEND_SRC_RGB                  = 0x80C9;
  this.BLEND_DST_ALPHA                = 0x80CA;
  this.BLEND_SRC_ALPHA                = 0x80CB;
  this.CONSTANT_COLOR                 = 0x8001;
  this.ONE_MINUS_CONSTANT_COLOR       = 0x8002;
  this.CONSTANT_ALPHA                 = 0x8003;
  this.ONE_MINUS_CONSTANT_ALPHA       = 0x8004;
  this.BLEND_COLOR                    = 0x8005;
  
  /* Buffer Objects */
  this.ARRAY_BUFFER                   = 0x8892;
  this.ELEMENT_ARRAY_BUFFER           = 0x8893;
  this.ARRAY_BUFFER_BINDING           = 0x8894;
  this.ELEMENT_ARRAY_BUFFER_BINDING   = 0x8895;
  
  this.STREAM_DRAW                    = 0x88E0;
  this.STATIC_DRAW                    = 0x88E4;
  this.DYNAMIC_DRAW                   = 0x88E8;
  
  this.BUFFER_SIZE                    = 0x8764;
  this.BUFFER_USAGE                   = 0x8765;
  
  this.CURRENT_VERTEX_ATTRIB          = 0x8626;
  
  /* CullFaceMode */
  this.FRONT                          = 0x0404;
  this.BACK                           = 0x0405;
  this.FRONT_AND_BACK                 = 0x0408;
  
  /* DepthFunction */
  /*      NEVER */
  /*      LESS */
  /*      EQUAL */
  /*      LEQUAL */
  /*      GREATER */
  /*      NOTEQUAL */
  /*      GEQUAL */
  /*      ALWAYS */
  
  /* EnableCap */
  /* TEXTURE_2D */
  this.CULL_FACE                      = 0x0B44;
  this.BLEND                          = 0x0BE2;
  this.DITHER                         = 0x0BD0;
  this.STENCIL_TEST                   = 0x0B90;
  this.DEPTH_TEST                     = 0x0B71;
  this.SCISSOR_TEST                   = 0x0C11;
  this.POLYGON_OFFSET_FILL            = 0x8037;
  this.SAMPLE_ALPHA_TO_COVERAGE       = 0x809E;
  this.SAMPLE_COVERAGE                = 0x80A0;
  
  /* ErrorCode */
  this.NO_ERROR                       = 0;
  this.INVALID_ENUM                   = 0x0500;
  this.INVALID_VALUE                  = 0x0501;
  this.INVALID_OPERATION              = 0x0502;
  this.OUT_OF_MEMORY                  = 0x0505;
  
  /* FrontFaceDirection */
  this.CW                             = 0x0900;
  this.CCW                            = 0x0901;
  
  /* GetPName */
  this.LINE_WIDTH                     = 0x0B21;
  this.ALIASED_POINT_SIZE_RANGE       = 0x846D;
  this.ALIASED_LINE_WIDTH_RANGE       = 0x846E;
  this.CULL_FACE_MODE                 = 0x0B45;
  this.FRONT_FACE                     = 0x0B46;
  this.DEPTH_RANGE                    = 0x0B70;
  this.DEPTH_WRITEMASK                = 0x0B72;
  this.DEPTH_CLEAR_VALUE              = 0x0B73;
  this.DEPTH_FUNC                     = 0x0B74;
  this.STENCIL_CLEAR_VALUE            = 0x0B91;
  this.STENCIL_FUNC                   = 0x0B92;
  this.STENCIL_FAIL                   = 0x0B94;
  this.STENCIL_PASS_DEPTH_FAIL        = 0x0B95;
  this.STENCIL_PASS_DEPTH_PASS        = 0x0B96;
  this.STENCIL_REF                    = 0x0B97;
  this.STENCIL_VALUE_MASK             = 0x0B93;
  this.STENCIL_WRITEMASK              = 0x0B98;
  this.STENCIL_BACK_FUNC              = 0x8800;
  this.STENCIL_BACK_FAIL              = 0x8801;
  this.STENCIL_BACK_PASS_DEPTH_FAIL   = 0x8802;
  this.STENCIL_BACK_PASS_DEPTH_PASS   = 0x8803;
  this.STENCIL_BACK_REF               = 0x8CA3;
  this.STENCIL_BACK_VALUE_MASK        = 0x8CA4;
  this.STENCIL_BACK_WRITEMASK         = 0x8CA5;
  this.VIEWPORT                       = 0x0BA2;
  this.SCISSOR_BOX                    = 0x0C10;
  /*      SCISSOR_TEST */
  this.COLOR_CLEAR_VALUE              = 0x0C22;
  this.COLOR_WRITEMASK                = 0x0C23;
  this.UNPACK_ALIGNMENT               = 0x0CF5;
  this.PACK_ALIGNMENT                 = 0x0D05;
  this.MAX_TEXTURE_SIZE               = 0x0D33;
  this.MAX_VIEWPORT_DIMS              = 0x0D3A;
  this.SUBPIXEL_BITS                  = 0x0D50;
  this.RED_BITS                       = 0x0D52;
  this.GREEN_BITS                     = 0x0D53;
  this.BLUE_BITS                      = 0x0D54;
  this.ALPHA_BITS                     = 0x0D55;
  this.DEPTH_BITS                     = 0x0D56;
  this.STENCIL_BITS                   = 0x0D57;
  this.POLYGON_OFFSET_UNITS           = 0x2A00;
  /*      POLYGON_OFFSET_FILL */
  this.POLYGON_OFFSET_FACTOR          = 0x8038;
  this.TEXTURE_BINDING_2D             = 0x8069;
  this.SAMPLE_BUFFERS                 = 0x80A8;
  this.SAMPLES                        = 0x80A9;
  this.SAMPLE_COVERAGE_VALUE          = 0x80AA;
  this.SAMPLE_COVERAGE_INVERT         = 0x80AB;
  
  /* GetTextureParameter */
  /*      TEXTURE_MAG_FILTER */
  /*      TEXTURE_MIN_FILTER */
  /*      TEXTURE_WRAP_S */
  /*      TEXTURE_WRAP_T */
  
  this.COMPRESSED_TEXTURE_FORMATS     = 0x86A3;
  
  /* HintMode */
  this.DONT_CARE                      = 0x1100;
  this.FASTEST                        = 0x1101;
  this.NICEST                         = 0x1102;
  
  /* HintTarget */
  this.GENERATE_MIPMAP_HINT            = 0x8192;
  
  /* DataType */
  this.BYTE                           = 0x1400;
  this.UNSIGNED_BYTE                  = 0x1401;
  this.SHORT                          = 0x1402;
  this.UNSIGNED_SHORT                 = 0x1403;
  this.INT                            = 0x1404;
  this.UNSIGNED_INT                   = 0x1405;
  this.FLOAT                          = 0x1406;
  
  /* PixelFormat */
  this.DEPTH_COMPONENT                = 0x1902;
  this.ALPHA                          = 0x1906;
  this.RGB                            = 0x1907;
  this.RGBA                           = 0x1908;
  this.LUMINANCE                      = 0x1909;
  this.LUMINANCE_ALPHA                = 0x190A;
  
  /* PixelType */
  /*      UNSIGNED_BYTE */
  this.UNSIGNED_SHORT_4_4_4_4         = 0x8033;
  this.UNSIGNED_SHORT_5_5_5_1         = 0x8034;
  this.UNSIGNED_SHORT_5_6_5           = 0x8363;
  
  /* Shaders */
  this.FRAGMENT_SHADER                  = 0x8B30;
  this.VERTEX_SHADER                    = 0x8B31;
  this.MAX_VERTEX_ATTRIBS               = 0x8869;
  this.MAX_VERTEX_UNIFORM_VECTORS       = 0x8DFB;
  this.MAX_VARYING_VECTORS              = 0x8DFC;
  this.MAX_COMBINED_TEXTURE_IMAGE_UNITS = 0x8B4D;
  this.MAX_VERTEX_TEXTURE_IMAGE_UNITS   = 0x8B4C;
  this.MAX_TEXTURE_IMAGE_UNITS          = 0x8872;
  this.MAX_FRAGMENT_UNIFORM_VECTORS     = 0x8DFD;
  this.SHADER_TYPE                      = 0x8B4F;
  this.DELETE_STATUS                    = 0x8B80;
  this.LINK_STATUS                      = 0x8B82;
  this.VALIDATE_STATUS                  = 0x8B83;
  this.ATTACHED_SHADERS                 = 0x8B85;
  this.ACTIVE_UNIFORMS                  = 0x8B86;
  this.ACTIVE_ATTRIBUTES                = 0x8B89;
  this.SHADING_LANGUAGE_VERSION         = 0x8B8C;
  this.CURRENT_PROGRAM                  = 0x8B8D;
  
  /* StencilFunction */
  this.NEVER                          = 0x0200;
  this.LESS                           = 0x0201;
  this.EQUAL                          = 0x0202;
  this.LEQUAL                         = 0x0203;
  this.GREATER                        = 0x0204;
  this.NOTEQUAL                       = 0x0205;
  this.GEQUAL                         = 0x0206;
  this.ALWAYS                         = 0x0207;
  
  /* StencilOp */
  /*      ZERO */
  this.KEEP                           = 0x1E00;
  this.REPLACE                        = 0x1E01;
  this.INCR                           = 0x1E02;
  this.DECR                           = 0x1E03;
  this.INVERT                         = 0x150A;
  this.INCR_WRAP                      = 0x8507;
  this.DECR_WRAP                      = 0x8508;
  
  /* StringName */
  this.VENDOR                         = 0x1F00;
  this.RENDERER                       = 0x1F01;
  this.VERSION                        = 0x1F02;
  
  /* TextureMagFilter */
  this.NEAREST                        = 0x2600;
  this.LINEAR                         = 0x2601;
  
  /* TextureMinFilter */
  /*      NEAREST */
  /*      LINEAR */
  this.NEAREST_MIPMAP_NEAREST         = 0x2700;
  this.LINEAR_MIPMAP_NEAREST          = 0x2701;
  this.NEAREST_MIPMAP_LINEAR          = 0x2702;
  this.LINEAR_MIPMAP_LINEAR           = 0x2703;
  
  /* TextureParameterName */
  this.TEXTURE_MAG_FILTER             = 0x2800;
  this.TEXTURE_MIN_FILTER             = 0x2801;
  this.TEXTURE_WRAP_S                 = 0x2802;
  this.TEXTURE_WRAP_T                 = 0x2803;
  
  /* TextureTarget */
  this.TEXTURE_2D                     = 0x0DE1;
  this.TEXTURE                        = 0x1702;
  
  this.TEXTURE_CUBE_MAP               = 0x8513;
  this.TEXTURE_BINDING_CUBE_MAP       = 0x8514;
  this.TEXTURE_CUBE_MAP_POSITIVE_X    = 0x8515;
  this.TEXTURE_CUBE_MAP_NEGATIVE_X    = 0x8516;
  this.TEXTURE_CUBE_MAP_POSITIVE_Y    = 0x8517;
  this.TEXTURE_CUBE_MAP_NEGATIVE_Y    = 0x8518;
  this.TEXTURE_CUBE_MAP_POSITIVE_Z    = 0x8519;
  this.TEXTURE_CUBE_MAP_NEGATIVE_Z    = 0x851A;
  this.MAX_CUBE_MAP_TEXTURE_SIZE      = 0x851C;
  
  /* TextureUnit */
  this.TEXTURE0                       = 0x84C0;
  this.TEXTURE1                       = 0x84C1;
  this.TEXTURE2                       = 0x84C2;
  this.TEXTURE3                       = 0x84C3;
  this.TEXTURE4                       = 0x84C4;
  this.TEXTURE5                       = 0x84C5;
  this.TEXTURE6                       = 0x84C6;
  this.TEXTURE7                       = 0x84C7;
  this.TEXTURE8                       = 0x84C8;
  this.TEXTURE9                       = 0x84C9;
  this.TEXTURE10                      = 0x84CA;
  this.TEXTURE11                      = 0x84CB;
  this.TEXTURE12                      = 0x84CC;
  this.TEXTURE13                      = 0x84CD;
  this.TEXTURE14                      = 0x84CE;
  this.TEXTURE15                      = 0x84CF;
  this.TEXTURE16                      = 0x84D0;
  this.TEXTURE17                      = 0x84D1;
  this.TEXTURE18                      = 0x84D2;
  this.TEXTURE19                      = 0x84D3;
  this.TEXTURE20                      = 0x84D4;
  this.TEXTURE21                      = 0x84D5;
  this.TEXTURE22                      = 0x84D6;
  this.TEXTURE23                      = 0x84D7;
  this.TEXTURE24                      = 0x84D8;
  this.TEXTURE25                      = 0x84D9;
  this.TEXTURE26                      = 0x84DA;
  this.TEXTURE27                      = 0x84DB;
  this.TEXTURE28                      = 0x84DC;
  this.TEXTURE29                      = 0x84DD;
  this.TEXTURE30                      = 0x84DE;
  this.TEXTURE31                      = 0x84DF;
  this.ACTIVE_TEXTURE                 = 0x84E0;
  
  /* TextureWrapMode */
  this.REPEAT                         = 0x2901;
  this.CLAMP_TO_EDGE                  = 0x812F;
  this.MIRRORED_REPEAT                = 0x8370;
  
  /* Uniform Types */
  this.FLOAT_VEC2                     = 0x8B50;
  this.FLOAT_VEC3                     = 0x8B51;
  this.FLOAT_VEC4                     = 0x8B52;
  this.INT_VEC2                       = 0x8B53;
  this.INT_VEC3                       = 0x8B54;
  this.INT_VEC4                       = 0x8B55;
  this.BOOL                           = 0x8B56;
  this.BOOL_VEC2                      = 0x8B57;
  this.BOOL_VEC3                      = 0x8B58;
  this.BOOL_VEC4                      = 0x8B59;
  this.FLOAT_MAT2                     = 0x8B5A;
  this.FLOAT_MAT3                     = 0x8B5B;
  this.FLOAT_MAT4                     = 0x8B5C;
  this.SAMPLER_2D                     = 0x8B5E;
  this.SAMPLER_3D                     = 0x8B5F;
  this.SAMPLER_CUBE                   = 0x8B60;
  
  /* Vertex Arrays */
  this.VERTEX_ATTRIB_ARRAY_ENABLED        = 0x8622;
  this.VERTEX_ATTRIB_ARRAY_SIZE           = 0x8623;
  this.VERTEX_ATTRIB_ARRAY_STRIDE         = 0x8624;
  this.VERTEX_ATTRIB_ARRAY_TYPE           = 0x8625;
  this.VERTEX_ATTRIB_ARRAY_NORMALIZED     = 0x886A;
  this.VERTEX_ATTRIB_ARRAY_POINTER        = 0x8645;
  this.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 0x889F;
  
  /* Read Format */
  this.IMPLEMENTATION_COLOR_READ_TYPE   = 0x8B9A;
  this.IMPLEMENTATION_COLOR_READ_FORMAT = 0x8B9B;

  /* Shader Source */
  this.COMPILE_STATUS                 = 0x8B81;
  
  /* Shader Precision-Specified Types */
  this.LOW_FLOAT                      = 0x8DF0;
  this.MEDIUM_FLOAT                   = 0x8DF1;
  this.HIGH_FLOAT                     = 0x8DF2;
  this.LOW_INT                        = 0x8DF3;
  this.MEDIUM_INT                     = 0x8DF4;
  this.HIGH_INT                       = 0x8DF5;
  
  /* Framebuffer Object. */
  this.FRAMEBUFFER                    = 0x8D40;
  this.RENDERBUFFER                   = 0x8D41;
  
  this.RGBA4                          = 0x8056;
  this.RGB5_A1                        = 0x8057;
  this.RGB565                         = 0x8D62;
  this.DEPTH_COMPONENT16              = 0x81A5;
  this.STENCIL_INDEX                  = 0x1901;
  this.STENCIL_INDEX8                 = 0x8D48;
  this.DEPTH_STENCIL                  = 0x84F9;
  
  this.RENDERBUFFER_WIDTH             = 0x8D42;
  this.RENDERBUFFER_HEIGHT            = 0x8D43;
  this.RENDERBUFFER_INTERNAL_FORMAT   = 0x8D44;
  this.RENDERBUFFER_RED_SIZE          = 0x8D50;
  this.RENDERBUFFER_GREEN_SIZE        = 0x8D51;
  this.RENDERBUFFER_BLUE_SIZE         = 0x8D52;
  this.RENDERBUFFER_ALPHA_SIZE        = 0x8D53;
  this.RENDERBUFFER_DEPTH_SIZE        = 0x8D54;
  this.RENDERBUFFER_STENCIL_SIZE      = 0x8D55;
  
  this.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE           = 0x8CD0;
  this.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME           = 0x8CD1;
  this.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL         = 0x8CD2;
  this.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 0x8CD3;
  
  this.COLOR_ATTACHMENT0              = 0x8CE0;
  this.DEPTH_ATTACHMENT               = 0x8D00;
  this.STENCIL_ATTACHMENT             = 0x8D20;
  this.DEPTH_STENCIL_ATTACHMENT       = 0x821A;
  
  this.NONE                           = 0;
  
  this.FRAMEBUFFER_COMPLETE                      = 0x8CD5;
  this.FRAMEBUFFER_INCOMPLETE_ATTACHMENT         = 0x8CD6;
  this.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 0x8CD7;
  this.FRAMEBUFFER_INCOMPLETE_DIMENSIONS         = 0x8CD9;
  this.FRAMEBUFFER_UNSUPPORTED                   = 0x8CDD;
  
  this.ACTIVE_TEXTURE                 = 0x84E0;
  this.FRAMEBUFFER_BINDING            = 0x8CA6;
  this.RENDERBUFFER_BINDING           = 0x8CA7;
  this.MAX_RENDERBUFFER_SIZE          = 0x84E8;
  
  this.INVALID_FRAMEBUFFER_OPERATION  = 0x0506;
  
  /* WebGL-specific enums */
  this.UNPACK_FLIP_Y_WEBGL            = 0x9240;
  this.UNPACK_PREMULTIPLY_ALPHA_WEBGL = 0x9241;
  this.CONTEXT_LOST_WEBGL             = 0x9242;
  this.UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;
  this.BROWSER_DEFAULT_WEBGL          = 0x9244;

  //=======
  // State
  //=======

  var commandBuffer = [];

  var nextId = 1; // valid ids are > 0

  var bindings = {
    texture2D: null,
    arrayBuffer: null,
    elementArrayBuffer: null,
    program: null,
    framebuffer: null,
    activeTexture: this.TEXTURE0,
    generateMipmapHint: this.DONT_CARE,
    blendSrcRGB: this.ONE,
    blendSrcAlpha: this.ONE,
    blendDstRGB: this.ZERO,
    blendDstAlpha: this.ZERO,
    blendEquationRGB: this.FUNC_ADD,
    blendEquationAlpha: this.FUNC_ADD,
    enabledState: {} // Stores whether various GL state via glEnable/glDisable/glIsEnabled/getParameter are enabled.
  };
  var stateDisabledByDefault = [this.BLEND, this.CULL_FACE, this.DEPTH_TEST, this.DITHER, this.POLYGON_OFFSET_FILL, this.SAMPLE_ALPHA_TO_COVERAGE, this.SAMPLE_COVERAGE, this.SCISSOR_TEST, this.STENCIL_TEST];
  for(var i in stateDisabledByDefault) {
    bindings.enabledState[stateDisabledByDefault[i]] = false; // It will be important to distinguish between false and undefined (undefined meaning the state cap enum is unknown/unsupported).
  }

  //==========
  // Functions
  //==========

  var that = this;

  // Helpers

  this.onmessage = function(msg) {
    //dump('worker GL got ' + JSON.stringify(msg) + '\n');
    switch(msg.op) {
      case 'setPrefetched': {
        WebGLWorker.prototype.prefetchedParameters = msg.parameters;
        WebGLWorker.prototype.prefetchedExtensions = msg.extensions;
        WebGLWorker.prototype.prefetchedPrecisions = msg.precisions;
        removeRunDependency('gl-prefetch');
        break;
      }
      default: throw 'weird gl onmessage ' + JSON.stringify(msg);
    }
  };

  function revname(name) {
    for (var x in that) if (that[x] === name) return x;
    return null;
  }

  // GL

  this.getParameter = function(name) {
    assert(name);
    if (name in this.prefetchedParameters) return this.prefetchedParameters[name];
    switch (name) {
      case this.TEXTURE_BINDING_2D: {
        return bindings.texture2D;
      }
      case this.ARRAY_BUFFER_BINDING: {
        return bindings.arrayBuffer;
      }
      case this.ELEMENT_ARRAY_BUFFER_BINDING: {
        return bindings.elementArrayBuffer;
      }
      case this.CURRENT_PROGRAM: {
        return bindings.program;
      }
      case this.FRAMEBUFFER_BINDING: {
        return bindings.framebuffer;
      }
      case this.ACTIVE_TEXTURE: {
        return bindings.activeTexture;
      }
      case this.GENERATE_MIPMAP_HINT: {
        return bindings.generateMipmapHint;
      }
      case this.BLEND_SRC_RGB: {
        return bindings.blendSrcRGB;
      }
      case this.BLEND_SRC_ALPHA: {
        return bindings.blendSrcAlpha;
      }
      case this.BLEND_DST_RGB: {
        return bindings.blendDstRGB;
      }
      case this.BLEND_DST_ALPHA: {
        return bindings.blendDstAlpha;
      }
      case this.BLEND_EQUATION_RGB: {
        return bindings.blendEquationRGB;
      }
      case this.BLEND_EQUATION_ALPHA: {
        return bindings.blendEquationAlpha;
      }
      default: {
        if (bindings.enabledState[name] !== undefined) return bindings.enabledState[name];
        throw 'TODO: get parameter ' + name + ' : ' + revname(name);
      }
    }
  };
  this.getExtension = function(name) {
    var i = this.prefetchedExtensions.indexOf(name);
    if (i < 0) return null;
    commandBuffer.push(1, name);
    switch (name) {
      case 'EXT_texture_filter_anisotropic': {
        return {
          TEXTURE_MAX_ANISOTROPY_EXT:     0x84FE,
          MAX_TEXTURE_MAX_ANISOTROPY_EXT: 0x84FF
        };
      }
      case 'WEBGL_draw_buffers': {
        return {
          COLOR_ATTACHMENT0_WEBGL     : 0x8CE0,
          COLOR_ATTACHMENT1_WEBGL     : 0x8CE1,
          COLOR_ATTACHMENT2_WEBGL     : 0x8CE2,
          COLOR_ATTACHMENT3_WEBGL     : 0x8CE3,
          COLOR_ATTACHMENT4_WEBGL     : 0x8CE4,
          COLOR_ATTACHMENT5_WEBGL     : 0x8CE5,
          COLOR_ATTACHMENT6_WEBGL     : 0x8CE6,
          COLOR_ATTACHMENT7_WEBGL     : 0x8CE7,
          COLOR_ATTACHMENT8_WEBGL     : 0x8CE8,
          COLOR_ATTACHMENT9_WEBGL     : 0x8CE9,
          COLOR_ATTACHMENT10_WEBGL    : 0x8CEA,
          COLOR_ATTACHMENT11_WEBGL    : 0x8CEB,
          COLOR_ATTACHMENT12_WEBGL    : 0x8CEC,
          COLOR_ATTACHMENT13_WEBGL    : 0x8CED,
          COLOR_ATTACHMENT14_WEBGL    : 0x8CEE,
          COLOR_ATTACHMENT15_WEBGL    : 0x8CEF,

          DRAW_BUFFER0_WEBGL          : 0x8825,
          DRAW_BUFFER1_WEBGL          : 0x8826,
          DRAW_BUFFER2_WEBGL          : 0x8827,
          DRAW_BUFFER3_WEBGL          : 0x8828,
          DRAW_BUFFER4_WEBGL          : 0x8829,
          DRAW_BUFFER5_WEBGL          : 0x882A,
          DRAW_BUFFER6_WEBGL          : 0x882B,
          DRAW_BUFFER7_WEBGL          : 0x882C,
          DRAW_BUFFER8_WEBGL          : 0x882D,
          DRAW_BUFFER9_WEBGL          : 0x882E,
          DRAW_BUFFER10_WEBGL         : 0x882F,
          DRAW_BUFFER11_WEBGL         : 0x8830,
          DRAW_BUFFER12_WEBGL         : 0x8831,
          DRAW_BUFFER13_WEBGL         : 0x8832,
          DRAW_BUFFER14_WEBGL         : 0x8833,
          DRAW_BUFFER15_WEBGL         : 0x8834,

          MAX_COLOR_ATTACHMENTS_WEBGL : 0x8CDF,
          MAX_DRAW_BUFFERS_WEBGL      : 0x8824,

          drawBuffersWEBGL: function(buffers) {
            that.drawBuffersWEBGL(buffers);
          }
        };
      }
      case 'OES_standard_derivatives': {
        return { FRAGMENT_SHADER_DERIVATIVE_HINT_OES: 0x8B8B };
      }
    };
    return true; // TODO: return an object here
  };
  this.getSupportedExtensions = function() {
    return this.prefetchedExtensions;
  };
  this.getShaderPrecisionFormat = function(shaderType, precisionType) {
    return this.prefetchedPrecisions[shaderType][precisionType];
  };
  this.enable = function(cap) {
    commandBuffer.push(2, cap);
    bindings.enabledState[cap] = true;
  };
  this.isEnabled = function(cap) {
    return bindings.enabledState[cap];
  };
  this.disable = function(cap) {
    commandBuffer.push(3, cap);
    bindings.enabledState[cap] = false;
  };
  this.clear = function(mask) {
    commandBuffer.push(4, mask);
  };
  this.clearColor = function(r, g, b, a) {
    commandBuffer.push(5, r, g, b, a);
  };
  this.createShader = function(type) {
    var id = nextId++;
    commandBuffer.push(6, type, id);
    return { id: id, what: 'shader', type: type };
  };
  this.deleteShader = function(shader) {
    if (!shader) return;
    commandBuffer.push(7, shader.id);
  };
  this.shaderSource = function(shader, source) {
    shader.source = source;
    commandBuffer.push(8, shader.id, source);
  };
  this.compileShader = function(shader) {
    commandBuffer.push(9, shader.id);
  };
  this.getShaderInfoLog = function(shader) {
    return ''; // optimistic assumption of success; no proxying
  };
  this.createProgram = function() {
    var id = nextId++;
    commandBuffer.push(10, id);
    return new WebGLProgram(id);
  };
  this.deleteProgram = function(program) {
    if (!program) return;
    commandBuffer.push(11, program.id);
  };
  this.attachShader = function(program, shader) {
    program.shaders.push(shader);
    commandBuffer.push(12, program.id, shader.id);
  };
  this.bindAttribLocation = function(program, index, name) {
    program.nextAttributes[name] = { what: 'attribute', name: name, size: -1, location: index, type: '?' }; // fill in size, type later
    program.nextAttributeVec[index] = name;
    commandBuffer.push(13, program.id, index, name);
  };
  this.getAttribLocation = function(program, name) {
    // all existing attribs are cached locally
    if (name in program.attributes) return program.attributes[name].location;
    return -1;
  };
  this.linkProgram = function(program) {
    // parse shader sources
    function getTypeId(text) {
      switch (text) {
        case 'bool': return that.BOOL;
        case 'int': return that.INT;
        case 'uint': return that.UNSIGNED_INT;
        case 'float': return that.FLOAT;
        case 'vec2': return that.FLOAT_VEC2;
        case 'vec3': return that.FLOAT_VEC3;
        case 'vec4': return that.FLOAT_VEC4;
        case 'ivec2': return that.INT_VEC2;
        case 'ivec3': return that.INT_VEC3;
        case 'ivec4': return that.INT_VEC4;
        case 'bvec2': return that.BOOL_VEC2;
        case 'bvec3': return that.BOOL_VEC3;
        case 'bvec4': return that.BOOL_VEC4;
        case 'mat2': return that.FLOAT_MAT2;
        case 'mat3': return that.FLOAT_MAT3;
        case 'mat4': return that.FLOAT_MAT4;
        case 'sampler2D': return that.SAMPLER_2D;
        case 'sampler3D': return that.SAMPLER_3D;
        case 'samplerCube': return that.SAMPLER_CUBE;
        default: throw 'not yet recognized type text: ' + text;
      }
    }
    function parseElementType(shader, type, obj, vec) {
      var source = shader.source;
      source = source.replace(/\n/g, '|\n'); // barrier between lines, to make regexing easier
      var newItems = source.match(new RegExp(type + '\\s+\\w+\\s+[\\w,\\s\[\\]]+;', 'g'));
      if (!newItems) return;
      newItems.forEach(function(item) {
        var m = new RegExp(type + '\\s+(\\w+)\\s+([\\w,\\s\[\\]]+);').exec(item);
        assert(m);
        m[2].split(',').map(function(name) { name = name.trim(); return name.search(/\s/) >= 0 ? '' : name }).filter(function(name) { return !!name }).forEach(function(name) {
          var size = 1;
          var open = name.indexOf('[');
          var fullname = name;
          if (open >= 0) {
            var close = name.indexOf(']');
            size = parseInt(name.substring(open+1, close));
            name = name.substr(0, open);
            fullname = name + '[0]';
          }
          if (!obj[name]) {
            obj[name] = { what: type, name: fullname, size: size, location: -1, type: getTypeId(m[1]) };
            if (vec) vec.push(name);
          }
        });
      });
    }

    program.uniforms = {};
    program.uniformVec = [];

    program.attributes = program.nextAttributes;
    program.attributeVec = program.nextAttributeVec;
    program.nextAttributes = {};
    program.nextAttributeVec = [];

    var existingAttributes = {};

    program.shaders.forEach(function(shader) {
      parseElementType(shader, 'uniform', program.uniforms, program.uniformVec);
      parseElementType(shader, 'attribute', existingAttributes, null);
    });

    // bind not-yet bound attributes
    for (var attr in existingAttributes) {
      if (!(attr in program.attributes)) {
        var index = program.attributeVec.length;
        program.attributes[attr] = { what: 'attribute', name: attr, size: -1, location: index, type: '?' }; // fill in size, type later
        program.attributeVec[index] = attr;
        commandBuffer.push(13, program.id, index, attr); // do a bindAttribLocation as well, so this takes effect in the link we are about to do
      }
      program.attributes[attr].size = existingAttributes[attr].size;
      program.attributes[attr].type = existingAttributes[attr].type;
    }

    commandBuffer.push(14, program.id);
  };
  this.getProgramParameter = function(program, name) {
    switch (name) {
      case this.ACTIVE_UNIFORMS: return program.uniformVec.length;
      case this.ACTIVE_ATTRIBUTES: return program.attributeVec.length;
      case this.LINK_STATUS: {
        // optimisticaly return success; client will abort on an actual error. we assume an error-free async workflow
        commandBuffer.push(15, program.id, name);
        return true;
      }
      default: throw 'bad getProgramParameter ' + revname(name);
    }
  };
  this.getActiveAttrib = function(program, index) {
    var name = program.attributeVec[index];
    if (!name) return null;
    return program.attributes[name];
  };
  this.getActiveUniform = function(program, index) {
    var name = program.uniformVec[index];
    if (!name) return null;
    return program.uniforms[name];
  };
  this.getUniformLocation = function(program, name) {
    var fullname = name;
    var index = -1;
    var open = name.indexOf('[');
    if (open >= 0) {
      var close = name.indexOf(']');
      index = parseInt(name.substring(open+1, close));
      name = name.substr(0, open);
    }
    if (!(name in program.uniforms)) return null;
    var id = nextId++;
    commandBuffer.push(16, program.id, fullname, id);
    return { what: 'location', uniform: program.uniforms[name], id: id, index: index };
  };
  this.getProgramInfoLog = function(shader) {
    return ''; // optimistic assumption of success; no proxying
  };
  this.useProgram = function(program) {
    commandBuffer.push(17, program ? program.id : 0);
    bindings.program = program;
  };
  this.uniform1i = function(location, data) {
    if (!location) return;
    commandBuffer.push(18, location.id, data);
  };
  this.uniform1f = function(location, data) {
    if (!location) return;
    commandBuffer.push(19, location.id, data);
  };
  this.uniform3fv = function(location, data) {
    if (!location) return;
    commandBuffer.push(20, location.id, new Float32Array(data));
  };
  this.uniform4f = function(location, x, y, z, w) {
    if (!location) return;
    commandBuffer.push(21, location.id, new Float32Array([x, y, z, w]));
  };
  this.uniform4fv = function(location, data) {
    if (!location) return;
    commandBuffer.push(21, location.id, new Float32Array(data));
  };
  this.uniformMatrix4fv = function(location, transpose, data) {
    if (!location) return;
    commandBuffer.push(22, location.id, transpose, new Float32Array(data));
  };
  this.vertexAttrib4fv = function(index, values) {
    commandBuffer.push(23, index, new Float32Array(values));
  };
  this.createBuffer = function() {
    var id = nextId++;
    commandBuffer.push(24, id);
    return new WebGLBuffer(id);
  };
  this.deleteBuffer = function(buffer) {
    if (!buffer) return;
    commandBuffer.push(25, buffer.id);
  };
  this.bindBuffer = function(target, buffer) {
    commandBuffer.push(26, target, buffer ? buffer.id : 0);
    switch (target) {
      case this.ARRAY_BUFFER_BINDING: {
        bindings.arrayBuffer = buffer;
        break;
      }
      case this.ELEMENT_ARRAY_BUFFER_BINDING: {
        bindings.elementArrayBuffer = buffer;
        break;
      }
    }
  };
  function duplicate(something) {
    // clone data properly: handles numbers, null, typed arrays, js arrays and array buffers
    if (!something || typeof something === 'number') return something;
    if (something.slice) return something.slice(0); // ArrayBuffer or js array
    return new something.constructor(something); // typed array
  }
  this.bufferData = function(target, something, usage) {
    commandBuffer.push(27, target, duplicate(something), usage);
  };
  this.bufferSubData = function(target, offset, something) {
    commandBuffer.push(28, target, offset, duplicate(something));
  };
  this.viewport = function(x, y, w, h) {
    commandBuffer.push(29, x, y, w, h);
  };
  this.vertexAttribPointer = function(index, size, type, normalized, stride, offset) {
    commandBuffer.push(30, index, size, type, normalized, stride, offset);
  };
  this.enableVertexAttribArray = function(index) {
    commandBuffer.push(31, index);
  };
  this.disableVertexAttribArray = function(index) {
    commandBuffer.push(32, index);
  };
  this.drawArrays = function(mode, first, count) {
    commandBuffer.push(33, mode, first, count);
  };
  this.drawElements = function(mode, count, type, offset) {
    commandBuffer.push(34, mode, count, type, offset);
  };
  this.getError = function() {
    // optimisticaly return success; client will abort on an actual error. we assume an error-free async workflow
    commandBuffer.push(35);
    return this.NO_ERROR;
  };
  this.createTexture = function() {
    var id = nextId++;
    commandBuffer.push(36, id);
    return new WebGLTexture(id);
  };
  this.deleteTexture = function(texture) {
    if (!texture) return;
    commandBuffer.push(37, texture.id);
    texture.id = 0;
  };
  this.isTexture = function(texture) {
    return texture && texture.what === 'texture' && texture.id > 0 && texture.binding;
  };
  this.bindTexture = function(target, texture) {
    switch (target) {
      case that.TEXTURE_2D: {
        bindings.texture2D = texture;
        break;
      }
    }
    if (texture) texture.binding = target;
    commandBuffer.push(38, target, texture ? texture.id : 0);
  };
  this.texParameteri = function(target, pname, param) {
    commandBuffer.push(39, target, pname, param);
  };
  this.texImage2D = function(target, level, internalformat, width, height, border, format, type, pixels) {
    if (pixels === undefined) {
      format = width; // width, height, border do not exist in the shorter overload
      type = height;
      pixels = border;
      assert(pixels instanceof Image);
      assert(internalformat === format && format === this.RGBA); // HTML Images are RGBA, 8-bit
      assert(type === this.UNSIGNED_BYTE);
      var data = pixels.data;
      width = data.width;
      height = data.height;
      border = 0;
      pixels = new Uint8Array(data.data); // XXX transform from clamped to normal, could have been done in duplicate
    }
    commandBuffer.push(40, target, level, internalformat, width, height, border, format, type, duplicate(pixels));
  };
  this.compressedTexImage2D = function(target, level, internalformat, width, height, border, pixels) {
    commandBuffer.push(41, target, level, internalformat, width, height, border, duplicate(pixels));
  };
  this.activeTexture = function(texture) {
    commandBuffer.push(42, texture);
    bindings.activeTexture = texture;
  };
  this.getShaderParameter = function(shader, pname) {
    switch (pname) {
      case this.SHADER_TYPE: return shader.type;
      case this.COMPILE_STATUS: {
        // optimisticaly return success; client will abort on an actual error. we assume an error-free async workflow
        commandBuffer.push(43, shader.id, pname);
        return true;
      }
      default: throw 'unsupported getShaderParameter ' + pname;
    }
  };
  this.clearDepth = function(depth) {
    commandBuffer.push(44, depth);
  };
  this.depthFunc = function(depth) {
    commandBuffer.push(45, depth);
  };
  this.frontFace = function(depth) {
    commandBuffer.push(46, depth);
  };
  this.cullFace = function(depth) {
    commandBuffer.push(47, depth);
  };
  this.readPixels = function(depth) {
    abort('readPixels is impossible, we are async GL');
  };
  this.pixelStorei = function(pname, param) {
    commandBuffer.push(48, pname, param);
  };
  this.depthMask = function(flag) {
    commandBuffer.push(49, flag);
  };
  this.depthRange = function(near, far) {
    commandBuffer.push(50, near, far);
  };
  this.blendFunc = function(sfactor, dfactor) {
    commandBuffer.push(51, sfactor, dfactor);
    bindings.blendSrcRGB = bindings.blendSrcAlpha = sfactor;
    bindings.blendDstRGB = bindings.blendDstAlpha = dfactor;
  };
  this.scissor = function(x, y, width, height) {
    commandBuffer.push(52, x, y, width, height);
  };
  this.colorMask = function(red, green, blue, alpha) {
    commandBuffer.push(53, red, green, blue, alpha);
  };
  this.lineWidth = function(width) {
    commandBuffer.push(54, width);
  };
  this.createFramebuffer = function() {
    var id = nextId++;
    commandBuffer.push(55, id);
    return new WebGLFramebuffer(id);
  };
  this.deleteFramebuffer = function(framebuffer) {
    if (!framebuffer) return;
    commandBuffer.push(56, framebuffer.id);
  };
  this.bindFramebuffer = function(target, framebuffer) {
    commandBuffer.push(57, target, framebuffer ? framebuffer.id : 0);
    bindings.framebuffer = framebuffer;
  };
  this.framebufferTexture2D = function(target, attachment, textarget, texture, level) {
    commandBuffer.push(58, target, attachment, textarget, texture ? texture.id : 0, level);
  };
  this.checkFramebufferStatus = function(target) {
    return this.FRAMEBUFFER_COMPLETE; // XXX totally wrong
  };
  this.createRenderbuffer = function() {
    var id = nextId++;
    commandBuffer.push(59, id);
    return new WebGLRenderbuffer(id);
  };
  this.deleteRenderbuffer = function(renderbuffer) {
    if (!renderbuffer) return;
    commandBuffer.push(60, renderbuffer.id);
  };
  this.bindRenderbuffer = function(target, renderbuffer) {
    commandBuffer.push(61, target, renderbuffer ? renderbuffer.id : 0);
  };
  this.renderbufferStorage = function(target, internalformat, width, height) {
    commandBuffer.push(62, target, internalformat, width, height);
  };
  this.framebufferRenderbuffer = function(target, attachment, renderbuffertarget, renderbuffer) {
    commandBuffer.push(63, target, attachment, renderbuffertarget, renderbuffer ? renderbuffer.id : 0);
  };
  this.debugPrint = function(text) { // useful to interleave debug output properly with client GL commands
    commandBuffer.push(64, text);
  };
  this.hint = function(target, mode) {
    commandBuffer.push(65, target, mode);
    if (target == this.GENERATE_MIPMAP_HINT) bindings.generateMipmapHint = mode;
  };
  this.blendEquation = function(mode) {
    commandBuffer.push(66, mode);
    bindings.blendEquationRGB = bindings.blendEquationAlpha = mode;
  };
  this.generateMipmap = function(target) {
    commandBuffer.push(67, target);
  };
  this.uniformMatrix3fv = function(location, transpose, data) {
    if (!location) return;
    commandBuffer.push(68, location.id, transpose, new Float32Array(data));
  };
  this.stencilMask = function(mask) {
    commandBuffer.push(69, mask);
  };
  this.clearStencil = function(s) {
    commandBuffer.push(70, s);
  };
  this.texSubImage2D = function(target, level, xoffset, yoffset, width, height, format, type, pixels) {
    if (pixels === undefined) {
      // shorter overload:      target, level, xoffset, yoffset, format,  type, pixels
      var formatTemp = format;
      format = width;
      type = height;
      pixels = formatTemp;
      assert(pixels instanceof Image);
      assert(format === this.RGBA); // HTML Images are RGBA, 8-bit
      assert(type === this.UNSIGNED_BYTE);
      var data = pixels.data;
      width = data.width;
      height = data.height;
      pixels = new Uint8Array(data.data); // XXX transform from clamped to normal, could have been done in duplicate
    }
    commandBuffer.push(71, target, level, xoffset, yoffset, width, height, format, type, duplicate(pixels));
  };
  this.uniform3f = function(location, x, y, z) {
    if (!location) return;
    commandBuffer.push(72, location.id, x, y, z);
  };
  this.blendFuncSeparate = function(srcRGB, dstRGB, srcAlpha, dstAlpha) {
    commandBuffer.push(73, srcRGB, dstRGB, srcAlpha, dstAlpha);
    bindings.blendSrcRGB = srcRGB;
    bindings.blendSrcAlpha = srcAlpha;
    bindings.blendDstRGB = dstRGB;
    bindings.blendDstAlpha = dstAlpha;
  }
  this.uniform2fv = function(location, data) {
    if (!location) return;
    commandBuffer.push(74, location.id, new Float32Array(data));
  };
  this.texParameterf = function(target, pname, param) {
    commandBuffer.push(75, target, pname, param);
  };
  this.isContextLost = function() {
    // optimisticaly return that everything is ok; client will abort on an actual context loss. we assume an error-free async workflow
    commandBuffer.push(76);
    return false;
  };
  this.isProgram = function(program) {
    return program && program.what === 'program';
  };
  this.blendEquationSeparate = function(rgb, alpha) {
    commandBuffer.push(77, rgb, alpha);
    bindings.blendEquationRGB = rgb;
    bindings.blendEquationAlpha = alpha;
  };
  this.stencilFuncSeparate = function(face, func, ref, mask) {
    commandBuffer.push(78, face, func, ref, mask);
  };
  this.stencilOpSeparate = function(face, fail, zfail, zpass) {
    commandBuffer.push(79, face, fail, zfail, zpass);
  };
  this.drawBuffersWEBGL = function(buffers) {
    commandBuffer.push(80, buffers);
  };
  this.uniform1iv = function(location, data) {
    if (!location) return;
    commandBuffer.push(81, location.id, new Int32Array(data));
  };
  this.uniform1fv = function(location, data) {
    if (!location) return;
    commandBuffer.push(82, location.id, new Float32Array(data));
  };

  // Setup

  var theoreticalTracker = new FPSTracker('server (theoretical)');
  var throttledTracker = new FPSTracker('server (client-throttled)');

  function preRAF() {
    //theoreticalTracker.tick();
    // if too many frames in queue, skip a main loop iter
    if (Math.abs(frameId - clientFrameId) >= 4) {
      return false;
    }
    //throttledTracker.tick();
  }

  var postRAFed = false;

  function postRAF() {
    if (commandBuffer.length > 0) {
      postMessage({ target: 'gl', op: 'render', commandBuffer: commandBuffer });
      commandBuffer = [];
    }
    postRAFed = true;
  }

  assert(!Browser.doSwapBuffers);
  Browser.doSwapBuffers = postRAF;

  var trueRAF = window.requestAnimationFrame;
  window.requestAnimationFrame = function(func) {
    trueRAF(function() {
      if (preRAF() === false) {
        window.requestAnimationFrame(func); // skip this frame, do it later
        return;
      }
      postRAFed = false;
      func();
      if (!postRAFed) { // if we already posted this frame (e.g. from doSwapBuffers) do not post again
        postRAF();
      }
    });
  }

}

// share prefetched data among all instances

WebGLWorker.prototype.prefetchedParameters = {};
WebGLWorker.prototype.prefetchedExtensions = {};
WebGLWorker.prototype.prefetchedPrecisions = {};


// Copyright 2013 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

if (typeof console === 'undefined') {
  // we can't call Module.printErr because that might be circular
  var console = {
    log: function(x) {
      if (typeof dump === 'function') dump('log: ' + x + '\n');
    },
    debug: function(x) {
      if (typeof dump === 'function') dump('debug: ' + x + '\n');
    },
    info: function(x) {
      if (typeof dump === 'function') dump('info: ' + x + '\n');
    },
    warn: function(x) {
      if (typeof dump === 'function') dump('warn: ' + x + '\n');
    },
    error: function(x) {
      if (typeof dump === 'function') dump('error: ' + x + '\n');
    },
  };
}

/*
function proxify(object, nick) {
  return new Proxy(object, {
    get: function(target, name) {
      var ret = target[name];
      if (ret === undefined) console.log('PROXY ' + [nick, target, name, ret, typeof ret]);
      return ret;
    }
  });
}
*/

function FPSTracker(text) {
  var last = 0;
  var mean = 0;
  var counter = 0;
  this.tick = function() {
    var now = Date.now();
    if (last > 0) {
      var diff = now - last;
      mean = 0.99*mean + 0.01*diff;
      if (counter++ === 60) {
        counter = 0;
        dump(text + ' fps: ' + (1000/mean).toFixed(2) + '\n');
      }
    }
    last = now;
  }
}

function Element() { throw 'TODO: Element' }
function HTMLCanvasElement() { throw 'TODO: HTMLCanvasElement' }
function HTMLVideoElement() { throw 'TODO: HTMLVideoElement' }

var KeyboardEvent = {
  'DOM_KEY_LOCATION_RIGHT': 2,
};

function PropertyBag() {
  this.addProperty = function(){};
  this.removeProperty = function(){};
  this.setProperty = function(){};
};

var IndexedObjects = {
  nextId: 1,
  cache: {},
  add: function(object) {
    object.id = this.nextId++;
    this.cache[object.id] = object;
  }
};

function EventListener() {
  this.listeners = {};

  this.addEventListener = function addEventListener(event, func) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(func);
  };

  this.removeEventListener = function(event, func) {
    var list = this.listeners[event];
    if (!list) return;
    var me = list.indexOf(func);
    if (me < 0) return;
    list.splice(me, 1);
  };

  this.fireEvent = function fireEvent(event) {
    event.preventDefault = function(){};

    if (event.type in this.listeners) {
      this.listeners[event.type].forEach(function(listener) {
        listener(event);
      });
    }
  };
}

function Image() {
  IndexedObjects.add(this);
  EventListener.call(this);
  var src = '';
  Object.defineProperty(this, 'src', {
    set: function(value) {
      src = value;
      assert(this.id);
      postMessage({ target: 'Image', method: 'src', src: src, id: this.id });
    },
    get: function() {
      return src;
    }
  });
}
Image.prototype.onload = function(){};
Image.prototype.onerror = function(){};

var HTMLImageElement = Image;

var window = this;
var windowExtra = new EventListener();
for (var x in windowExtra) window[x] = windowExtra[x];

window.close = function window_close() {
  postMessage({ target: 'window', method: 'close' });
};

window.alert = function(text) {
  err('alert forever: ' + text);
  while (1){};
};

window.scrollX = window.scrollY = 0; // TODO: proxy these

window.WebGLRenderingContext = WebGLWorker;

window.requestAnimationFrame = (function() {
  // similar to Browser.requestAnimationFrame
  var nextRAF = 0;
  return function(func) {
    // try to keep 60fps between calls to here
    var now = Date.now();
    if (nextRAF === 0) {
      nextRAF = now + 1000/60;
    } else {
      while (now + 2 >= nextRAF) { // fudge a little, to avoid timer jitter causing us to do lots of delay:0
        nextRAF += 1000/60;
      }
    }
    var delay = Math.max(nextRAF - now, 0);
    setTimeout(func, delay);
  };
})();

var webGLWorker = new WebGLWorker();

var document = new EventListener();

document.createElement = function document_createElement(what) {
  switch(what) {
    case 'canvas': {
      var canvas = new EventListener();
      canvas.ensureData = function canvas_ensureData() {
        if (!canvas.data || canvas.data.width !== canvas.width || canvas.data.height !== canvas.height) {
          canvas.data = {
            width: canvas.width,
            height: canvas.height,
            data: new Uint8Array(canvas.width*canvas.height*4)
          };
          if (canvas === Module['canvas']) {
            postMessage({ target: 'canvas', op: 'resize', width: canvas.width, height: canvas.height });
          }
        }
      };
      canvas.getContext = function canvas_getContext(type, attributes) {
        if (canvas === Module['canvas']) {
          postMessage({ target: 'canvas', op: 'getContext', type: type, attributes: attributes });
        }
        if (type === '2d') {
          return {
            getImageData: function(x, y, w, h) {
              assert(x == 0 && y == 0 && w == canvas.width && h == canvas.height);
              canvas.ensureData();
              return {
                width: canvas.data.width,
                height: canvas.data.height,
                data: new Uint8Array(canvas.data.data) // TODO: can we avoid this copy?
              };
            },
            putImageData: function(image, x, y) {
              canvas.ensureData();
              assert(x == 0 && y == 0 && image.width == canvas.width && image.height == canvas.height);
              canvas.data.data.set(image.data); // TODO: can we avoid this copy?
              if (canvas === Module['canvas']) {
                postMessage({ target: 'canvas', op: 'render', image: canvas.data });
              }
            },
            drawImage: function(image, x, y, w, h, ox, oy, ow, oh) {
              assert (!x && !y && !ox && !oy);
              assert(w === ow && h === oh);
              assert(canvas.width === w || w === undefined);
              assert(canvas.height === h || h === undefined);
              assert(image.width === canvas.width && image.height === canvas.height);
              canvas.ensureData();
              canvas.data.data.set(image.data.data); // TODO: can we avoid this copy?
              if (canvas === Module['canvas']) {
                postMessage({ target: 'canvas', op: 'render', image: canvas.data });
              }
            }
          };
        } else {
          return webGLWorker;
        }
      };
      canvas.boundingClientRect = {};
      canvas.getBoundingClientRect = function canvas_getBoundingClientRect() {
        return {
          width: canvas.boundingClientRect.width,
          height: canvas.boundingClientRect.height,
          top: canvas.boundingClientRect.top,
          left: canvas.boundingClientRect.left,
          bottom: canvas.boundingClientRect.bottom,
          right: canvas.boundingClientRect.right
        };
      };
      canvas.style = new PropertyBag();
      canvas.exitPointerLock = function(){};

      canvas.width_ = canvas.width_ || 0;
      canvas.height_ = canvas.height_ || 0;
      Object.defineProperty(canvas, 'width', {
        set: function(value) {
          canvas.width_ = value;
          if (canvas === Module['canvas']) {
            postMessage({ target: 'canvas', op: 'resize', width: canvas.width_, height: canvas.height_ });
          }
        },
        get: function() {
          return canvas.width_;
        }
      });
      Object.defineProperty(canvas, 'height', {
        set: function(value) {
          canvas.height_ = value;
          if (canvas === Module['canvas']) {
            postMessage({ target: 'canvas', op: 'resize', width: canvas.width_, height: canvas.height_ });
          }
        },
        get: function() {
          return canvas.height_;
        }
      });

      var style = {
        parentCanvas: canvas,
        removeProperty: function(){},
        setProperty:  function(){},
      };

      Object.defineProperty(style, 'cursor', {
        set: function(value) {
          if (!style.cursor_ || style.cursor_ !== value) {
            style.cursor_ = value;
            if (style.parentCanvas === Module['canvas']) {
              postMessage({ target: 'canvas', op: 'setObjectProperty', object: 'style', property: 'cursor', value: style.cursor_ });
            }
          }
        },
        get: function() {
          return style.cursor_;
        }
      });

      canvas.style = style;

      return canvas;
    }
    default: throw 'document.createElement ' + what;
  }
};

document.getElementById = function(id) {
  if (id === 'canvas' || id === 'application-canvas') {
    return Module.canvas;
  }
  throw 'document.getElementById failed on ' + id;
};

document.documentElement = {};

document.styleSheets = [{
  cssRules: [], // TODO: forward to client
  insertRule: function(rule, i) {
    this.cssRules.splice(i, 0, rule);
  }
}];

document.URL = 'http://worker.not.yet.ready.wait.for.window.onload?fake';

function Audio() {
  warnOnce('faking Audio elements, no actual sound will play');
}
Audio.prototype = new EventListener();
Object.defineProperty(Audio.prototype, 'src', {
  set: function(value) {
    if (value[0] === 'd') return; // ignore data urls
    this.onerror();
  },
});

Audio.prototype.play = function(){};
Audio.prototype.pause = function(){};

Audio.prototype.cloneNode = function() {
  return new Audio;
}

function AudioContext() {
  warnOnce('faking WebAudio elements, no actual sound will play');
  function makeNode() {
    return {
      connect: function(){},
      disconnect: function(){},
    }
  }
  this.listener = {
    setPosition: function() {},
    setOrientation: function() {},
  };
  this.decodeAudioData = function() {}; // ignore callbacks
  this.createBuffer = makeNode;
  this.createBufferSource = makeNode;
  this.createGain = makeNode;
  this.createPanner = makeNode;
}

var screen = {
  width: 0,
  height: 0
};

Module.canvas = document.createElement('canvas');

Module.setStatus = function(){};

out = function Module_print(x) {
  //dump('OUT: ' + x + '\n');
  postMessage({ target: 'stdout', content: x });
};
err = function Module_printErr(x) {
  //dump('ERR: ' + x + '\n');
  postMessage({ target: 'stderr', content: x });
};

// Frame throttling

var frameId = 0;
var clientFrameId = 0;

var postMainLoop = Module['postMainLoop'];
Module['postMainLoop'] = function() {
  if (postMainLoop) postMainLoop();
  // frame complete, send a frame id
  postMessage({ target: 'tick', id: frameId++ });
  commandBuffer = [];
};

// Wait to start running until we receive some info from the client

  addRunDependency('gl-prefetch');
  addRunDependency('worker-init');

// buffer messages until the program starts to run

var messageBuffer = null;
var messageResenderTimeout = null;

function messageResender() {
  if (calledMain) {
    assert(messageBuffer && messageBuffer.length > 0);
    messageResenderTimeout = null;
    messageBuffer.forEach(function(message) {
      onmessage(message);
    });
    messageBuffer = null;
  } else {
    messageResenderTimeout = setTimeout(messageResender, 100);
  }
}

function onMessageFromMainEmscriptenThread(message) {
  if (!calledMain && !message.data.preMain) {
    if (!messageBuffer) {
      messageBuffer = [];
      messageResenderTimeout = setTimeout(messageResender, 100);
    }
    messageBuffer.push(message);
    return;
  }
  if (calledMain && messageResenderTimeout) {
    clearTimeout(messageResenderTimeout);
    messageResender();
  }
  //dump('worker got ' + JSON.stringify(message.data).substr(0, 150) + '\n');
  switch (message.data.target) {
    case 'document': {
      document.fireEvent(message.data.event);
      break;
    }
    case 'window': {
      window.fireEvent(message.data.event);
      break;
    }
    case 'canvas': {
      if (message.data.event) {
        Module.canvas.fireEvent(message.data.event);
      } else if (message.data.boundingClientRect) {
        Module.canvas.boundingClientRect = message.data.boundingClientRect;
      } else throw 'ey?';
      break;
    }
    case 'gl': {
      webGLWorker.onmessage(message.data);
      break;
    }
    case 'tock': {
      clientFrameId = message.data.id;
      break;
    }
    case 'Image': {
      var img = IndexedObjects.cache[message.data.id];
      switch (message.data.method) {
        case 'onload': {
          img.width = message.data.width;
          img.height = message.data.height;
          img.data = { width: img.width, height: img.height, data: message.data.data };
          img.complete = true;
          img.onload();
          break;
        }
        case 'onerror': {
          img.onerror({ srcElement: img });
          break;
        }
      }
      break;
    }
    case 'IDBStore': {
      assert(message.data.method === 'response');
      assert(IDBStore.pending);
      IDBStore.pending(message.data);
      break;
    }
    case 'worker-init': {
      Module.canvas = document.createElement('canvas');
      screen.width = Module.canvas.width_ = message.data.width;
      screen.height = Module.canvas.height_ = message.data.height;
      Module.canvas.boundingClientRect = message.data.boundingClientRect;
      document.URL = message.data.URL;
      window.fireEvent({ type: 'load' });
      removeRunDependency('worker-init');
      break;
    }
    case 'custom': {
      if (Module['onCustomMessage']) {
        Module['onCustomMessage'](message);
      } else {
        throw 'Custom message received but worker Module.onCustomMessage not implemented.';
      }
      break;
    }
    case 'setimmediate': {
      if (Module['setImmediates']) Module['setImmediates'].shift()();
      break;
    }
    default: throw 'wha? ' + message.data.target;
  }
};

  onmessage = onMessageFromMainEmscriptenThread;

function postCustomMessage(data) {
  postMessage({ target: 'custom', userData: data });
}


}

// === Auto-generated postamble setup entry stuff ===

Module['asm'] = asm;












































































/**
 * @constructor
 * @extends {Error}
 * @this {ExitStatus}
 */
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun']) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = function callMain(args) {

  args = args || [];

  ensureInitRuntime();

  var argc = args.length+1;
  var argv = stackAlloc((argc + 1) * 4);
  HEAP32[argv >> 2] = allocateUTF8OnStack(Module['thisProgram']);
  for (var i = 1; i < argc; i++) {
    HEAP32[(argv >> 2) + i] = allocateUTF8OnStack(args[i - 1]);
  }
  HEAP32[(argv >> 2) + argc] = 0;


  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
      exit(ret, /* implicit = */ true);
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      var toLog = e;
      if (e && typeof e === 'object' && e.stack) {
        toLog = [e, e.stack];
      }
      err('exception thrown: ' + toLog);
      Module['quit'](1, e);
    }
  } finally {
    calledMain = true;
  }
}




/** @type {function(Array=)} */
function run(args) {
  args = args || Module['arguments'];

  if (runDependencies > 0) {
    return;
  }


  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    if (ABORT) return;

    ensureInitRuntime();

    preMain();

    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

    if (Module['_main'] && shouldRunNow) Module['callMain'](args);

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = run;


function exit(status, implicit) {

  // if this is just main exit-ing implicitly, and the status is 0, then we
  // don't need to do anything here and can just leave. if the status is
  // non-zero, though, then we need to report it.
  // (we may have warned about this earlier, if a situation justifies doing so)
  if (implicit && Module['noExitRuntime'] && status === 0) {
    return;
  }

  if (Module['noExitRuntime']) {
  } else {

    ABORT = true;
    EXITSTATUS = status;
    STACKTOP = initialStackTop;

    exitRuntime();

    if (Module['onExit']) Module['onExit'](status);
  }

  Module['quit'](status, new ExitStatus(status));
}

var abortDecorators = [];

function abort(what) {
  if (Module['onAbort']) {
    Module['onAbort'](what);
  }

  if (what !== undefined) {
    out(what);
    err(what);
    what = JSON.stringify(what)
  } else {
    what = '';
  }

  ABORT = true;
  EXITSTATUS = 1;

  throw 'abort(' + what + '). Build with -s ASSERTIONS=1 for more info.';
}
Module['abort'] = abort;

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}

  Module["noExitRuntime"] = true;

run();





// {{MODULE_ADDITIONS}}



