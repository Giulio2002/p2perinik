GOPATH=$(shell pwd)/vendor:$(shell pwd)
GOBIN=$(shell pwd)
GOFILES=$(wildcard *.go)
GONAME=Userver

build:
	@echo "Building $(GOFILES)"
	@GOPATH=$(GOPATH) GOBIN=$(GOBIN) go build -o $(GONAME) $(GOFILES)

get:
	@GOPATH=$(GOPATH) GOBIN=$(GOBIN) go get .

install:
	@GOPATH=$(GOPATH) GOBIN=$(GOBIN) go install $(GOFILES)

stop:
	killall $(GONAME)

clear:
	@clear

clean:
	@echo "Cleaning"
	@GOPATH=$(GOPATH) GOBIN=$(GOBIN) go clean

.PHONY: build get install stop clean