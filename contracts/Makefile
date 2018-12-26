compile:
	abigen --sol p2perinik.sol --pkg p2perinik --out p2perinik.go
	abigen --sol identity.sol --pkg identity --out identity.go
replace:
	abigen --sol p2perinik.sol --pkg p2perinik --out p2perinik.go
	abigen --sol identity.sol --pkg identity --out identity.go
	mv p2perinik.go ../src/src/p2perinik/p2perinik.go
	mv identity.go ../Userver/vendor/src/identity
clean:
	rm *.go
	rm ../src/src/p2perinik/*.go
