package main

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
//    "github.com/ethereum/go-ethereum/accounts"
    "github.com/ethereum/go-ethereum/accounts/keystore"
    "github.com/ethereum/go-ethereum/common"
//    "github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
    "github.com/ethereum/go-ethereum/ethclient"
    "miximus"
    "time"
)

var (
    PrivateKey *ecdsa.PrivateKey
    CoinBaseAddress    = ""
    MiximusAddress common.Address
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
	MiximusAddress = common.HexToAddress("0xB586453a8e44c86E012958E48a0DeCED462BD16e")
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

func miximusDeposit() {
	client, err := ethclient.Dial("https://rinkeby.infura.io")
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
    auth.GasLimit = uint64(300000) // in units
    auth.GasPrice = gasPrice
    // Declare new instance of Miximus
    instance, err := miximus.NewMiximus(MiximusAddress, client)
    // Generate nullifier
    sk := [32]byte{}
    nullifier := [32]byte{}
	copy(sk[:], []byte(genSk()))
	copy(nullifier[:], []byte(genNullifier("0x0")))
	leaf, err := instance.GetSha256(&bind.CallOpts{}, nullifier, sk)
	// check error
	if err != nil {
		panic(err)
	}
	// Finally deposit
	tx, err := instance.Deposit(auth, leaf) 
	// This is awful. :-(
	for err != nil {
		receipt, err := EthGetTransactionReceipt(tx)
	}
}