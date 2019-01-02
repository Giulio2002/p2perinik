all:
	emcc main.c utils/*.c ethereum_module/*.c marketcap_module/*.c userver_module/*.c -s WASM=1 -O1 -o index.js -s FETCH=1  --proxy-to-worker
	mv index.js index.worker.js interface/
	mv index.wasm interface/
clean:
	rm interface/index.wasm
	rm interface/index.js
	rm interface/index.worker.js

