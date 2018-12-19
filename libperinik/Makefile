all:
	gcc -fPIC -c crypto.c -m32
	gcc -fPIC -c p2perinik.c -m32
	ar -rc libperinik.a *.o 
clean:
	rm *.o
	rm *.a