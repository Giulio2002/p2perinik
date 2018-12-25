package main

import (
    "log"
    "net/http"
    "github.com/gorilla/mux"
)

const (
	serverAddress = "0x909C6D737d04bFA5DD47A059524f4dE0e3C507b5"
	serverPvt = "BB695ACB57F8D39717CCB953F04482CE397BA9BAA8D4CE266708A3F103511C0A"
	IdentityAddress = "";
)
// our main function
func main() {
    router := mux.NewRouter()
    router.HandleFunc("/create", CreateAddress).Methods("POST")
    router.HandleFunc("/name/{address}", queryName).Methods("GET")
    log.Fatal(http.ListenAndServe(":8000", router))
}