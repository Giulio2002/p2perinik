all:
	emcc *.c -s WASM=1 -s SIDE_MODULE=1 -O2 -o userver.wasm
clean:
	rm *.wasm