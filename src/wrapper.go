package main

import (
//    "math/big"
//    "context"
    "io/ioutil"
    "strings"
    "os"
    "fmt"
    "crypto/ecdsa"
    "encoding/json"
    "golang.org/x/crypto/ssh/terminal"
//    "github.com/ethereum/go-ethereum/accounts"
    "github.com/ethereum/go-ethereum/accounts/keystore"
//    "github.com/ethereum/go-ethereum/common"
//    "github.com/ethereum/go-ethereum/core/types"
//    "github.com/ethereum/go-ethereum/ethclient"
//    "miximus"
)

var (
    PrivateKey *ecdsa.PrivateKey
    CoinBaseAddress    = ""
    Miximus_Address    = "0xB586453a8e44c86E012958E48a0DeCED462BD16e"
)
const ChainID = 4

func retrieveCoinbase (keystore_path string) {
	// Open our jsonFile
	jsonFile, err := os.Open(keystore_path)
	// if we os.Open returns an error then handle it
	if err != nil {
		fmt.Println(err)
	}
	// defer the closing of our jsonFile so that we can parse it later on
	defer jsonFile.Close()

	byteValue, _ := ioutil.ReadAll(jsonFile)

	var result map[string]interface{}
	json.Unmarshal([]byte(byteValue), &result)
	CoinBaseAddress = "0x" + result["address"].(string)
}

func setupMetadata (keystore_path string) {
	retrieveCoinbase(keystore_path)
	// ask for passphrase
	fmt.Print("Insert passphrase for ", CoinBaseAddress, ": ")
	passphrase, _ := terminal.ReadPassword(0)
	// generate valid password
	signPassphrase := strings.TrimRight(string(passphrase), "\r\n")
	// read keystore
	keyJSON, err := ioutil.ReadFile(keystore_path)
	//check errpr
	if err != nil {
		panic(err)
	}
	// Decrypt keystore
	keyWrapper, err := keystore.DecryptKey(keyJSON, signPassphrase)
	// check error
	if err != nil {
		panic(err)
	}
	// setup metadata
	PrivateKey = keyWrapper.PrivateKey;
}