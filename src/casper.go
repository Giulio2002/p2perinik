package main

import (
    "math/big"
    "context"
    "io/ioutil"
    "strings"
    "github.com/ethereum/go-ethereum/accounts"
    "github.com/ethereum/go-ethereum/accounts/keystore"
    "github.com/ethereum/go-ethereum/common"
    "github.com/ethereum/go-ethereum/core/types"
    "github.com/ethereum/go-ethereum/ethclient"
)

var (
    Keystore   		   = ""
    WalletPasswordFile = ""
    CoinBaseAddress    = ""
    Miximus_Address    = "0xB586453a8e44c86E012958E48a0DeCED462BD16e"
)
const ChainID = 4

func SignAndSendTX() error { 
	client, _ := ethclient.Dial("https://rinkeby.infura.io")

	// Create account definitions
	fromAccDef := accounts.Account{
		Address: common.HexToAddress(CoinBaseAddress),
	}

	b, _ := ioutil.ReadFile(WalletPasswordFile)
	//check error
	signPassphrase := strings.TrimRight(string(b), "\r\n")

	nonce, _ := client.PendingNonceAt(context.Background(), fromAccDef.Address)
	//check error
	value := big.NewInt(100000000000000000) // in wei (0.1 eth)
	gasLimit := uint64(21000)               // in units
	gasPrice := big.NewInt(20000000)
	
	var data []byte //nil
	toAddress := common.HexToAddress(Miximus_Address)
	tx := types.NewTransaction(nonce, toAddress, value, gasLimit, gasPrice, data)

	// Open the account key file
	keyJSON, _ := ioutil.ReadFile(Keystore)
	//check error

	// Get the private key
	keyWrapper, _ := keystore.DecryptKey(keyJSON, signPassphrase)
	//check error

	signedTx, _ := types.SignTx(tx, types.NewEIP155Signer(big.NewInt(ChainID)), keyWrapper.PrivateKey)
	//check error

	// Final Step
	txErr := client.SendTransaction(context.Background(), signedTx)

	if txErr != nil {
		return txErr
	}
	
	return nil
}