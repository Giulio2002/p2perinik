package main
/*
#cgo CFLAGS: -I ../libperinik
#cgo LDFLAGS: /home/giulio/p2perinik/libperinik/libperinik.a
#include <p2perinik.h>
*/
import "C"
import (
    "math/big"
    "io/ioutil"
    "strings"
    "os"
    "fmt"
    "context"
    "crypto/ecdsa"
    "encoding/json"
    "golang.org/x/crypto/ssh/terminal"
//  "github.com/ethereum/go-ethereum"
//  "github.com/ethereum/go-ethereum/accounts/abi"
    "github.com/ethereum/go-ethereum/accounts/keystore"
    "github.com/ethereum/go-ethereum/common"
//  "github.com/ethereum/go-ethereum/core/types"
    "github.com/ethereum/go-ethereum/accounts/abi/bind"
    "github.com/ethereum/go-ethereum/ethclient"
    "p2perinik"
    "unsafe"
    "time"
)

var (
    PrivateKey *ecdsa.PrivateKey
    PeerAddress = ""
    CoinBaseAddress    = ""
    MiximusAddress common.Address
)
const ChainID = 4

func retrieveCoinbase (keystore_path string) {
	// Open our jsonFile
	jsonFile, err := os.Open(keystore_path)
	// if we os.Open returns an error then handle it
	if err != nil {
		fmt.Println("can't find: " + keystore_path)
		os.Exit(1)
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
	MiximusAddress = common.HexToAddress("0x053e2893b273a847d46A1E7F4734C262881DDfAd")
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
	PrivateKey = keyWrapper.PrivateKey
}

func sendData(data string) {
	rw.WriteString(fmt.Sprintf("%s\n", data))
	time.Sleep(1)
	rw.Flush()
	time.Sleep(1)
}

func miximusDeposit() { 
	CPeerAddress := C.CString(PeerAddress)
	password, specialNumber := genKey(PeerAddress)
	Cpassword := C.CString(password)
	// password := C.GoString((*C.char)(unsafe.Pointer(Cpassword)))
	// Prepare to free pointer
	defer C.free(unsafe.Pointer(CPeerAddress))
	defer C.free(unsafe.Pointer(Cpassword))
	// low-level operations
	Cencrypted := C.P2PERINIK_Encrypt(CPeerAddress, Cpassword)
	defer C.free(unsafe.Pointer(Cencrypted))
	encrypted := C.GoString((*C.char)(unsafe.Pointer(Cencrypted)))
	// init connection with infura
	client, err := ethclient.Dial("wss://rinkeby.infura.io/ws")
	// Check if ethclient is connected
	if err != nil {
		panic(err)
	}
	// we convert our address into a valid format
	address := common.HexToAddress(CoinBaseAddress)
	// We get nonce
    nonce, err := client.PendingNonceAt(context.Background(), address)
    if err != nil {
    	panic(err)
    } 
    // we get ideal gas price
    gasPrice, err := client.SuggestGasPrice(context.Background())
    if err != nil {
        panic(err)
    }
    // Fill out transaction field
    auth := bind.NewKeyedTransactor(PrivateKey)
    auth.Nonce = big.NewInt(int64(nonce))
    auth.Value = big.NewInt(1000000000000000000) // in wei
    auth.GasLimit = uint64(4000000) // in units
    auth.GasPrice = gasPrice
    // Declare new instantiation
    instance, err := p2perinik.NewP2Perinik(MiximusAddress, client)
    // get bytes of encrypted address and password
    bytesEncrypted, _ := instance.ToBytes(&bind.CallOpts{} ,encrypted)
    // obtain special hash
    specialHash , _ := instance.GenerateSpecialHash(&bind.CallOpts{}, bytesEncrypted, common.HexToAddress(PeerAddress), specialNumber)
    fmt.Println(password)
    fmt.Println(encrypted)
    instance.Deposit(auth, bytesEncrypted, specialHash)
    time.Sleep(60)
    sendData("/d" + password)
}

func p2perinikWithdraw(key string) bool {
	client, err := ethclient.Dial("wss://rinkeby.infura.io/ws")
	// Check if ethclient is connected
	if err != nil {
		return false
	}
	// we convert our address into a valid format
	address := common.HexToAddress(CoinBaseAddress)
	// We get nonce
    nonce, err := client.PendingNonceAt(context.Background(), address)
    if err != nil {
    	return false
    } 
    // we get ideal gas price
    gasPrice, err := client.SuggestGasPrice(context.Background())
    if err != nil {
        return false
    }
    // Fill out transaction field
    auth := bind.NewKeyedTransactor(PrivateKey)
    auth.Nonce = big.NewInt(int64(nonce))
    auth.Value = big.NewInt(0) // in wei
    auth.GasLimit = uint64(4000000) // in units
    auth.GasPrice = gasPrice
    // Declare new instantiation
    instance, err := p2perinik.NewP2Perinik(MiximusAddress, client)
    // get bytes of key
    bytesKey, _ := instance.ToBytes(&bind.CallOpts{} ,key)
    instance.Withdraw(auth, bytesKey)
    return true
}