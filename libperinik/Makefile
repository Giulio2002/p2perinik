all:
	gcc -fPIC -c crypto.c -m32
	gcc -fPIC -c p2perinik.c -m32
	ar -rc libperinik.a *.o
	gcc -fPIC -c crypto.c -m64
	gcc -fPIC -c p2perinik.c -m64
	gcc -shared crypto.o p2perinik.o -o libperinik.so 
	rm *.o
clean:
	rm *.so
	rm *.a