all:
	emcc *.c -s WASM=1 -s SIDE_MODULE=1 -O1 -o userver.wasm
clean:
	rm *.wasm