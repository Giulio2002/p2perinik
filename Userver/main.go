package main

import (
    "log"
    "net/http"
    "github.com/gorilla/mux"
)

const (
	serverAddress = "0x909C6D737d04bFA5DD47A059524f4dE0e3C507b5"
	serverPvt = "BB695ACB57F8D39717CCB953F04482CE397BA9BAA8D4CE266708A3F103511C0A"
	identityAddress = "0xcfd7aa7dc0c171da8ca0d71ac0602cbed6a4f2b8"
)
// our main function
func main() {
    router := mux.NewRouter()
    router.HandleFunc("/create/{name}", CreateAddress).Methods("POST")
    router.HandleFunc("/name/{address}", queryName).Methods("GET")
    router.HandleFunc("/address/{name}", queryAddress).Methods("GET")
    log.Fatal(http.ListenAndServe(":8000", router))
}