package main

import (
    "net/http"
    "context"
    "log"
    "math/big"
    "github.com/ethereum/go-ethereum/accounts/abi/bind"
    "github.com/ethereum/go-ethereum/common"
    "github.com/ethereum/go-ethereum/crypto"
    "github.com/ethereum/go-ethereum/ethclient"
    "identity"
    "github.com/bitly/go-simplejson"
    "github.com/gorilla/mux"
    "errors"
    "bytes"
)

func CreateAddress (w http.ResponseWriter, r *http.Request) {
    //Allow CORS here By * or specific origin
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
    // Initialize main variables
    client, _ := ethclient.Dial("https://rinkeby.infura.io")
    log.Println("Received create request");
    identityContract, _ := identity.NewIdentity(common.HexToAddress(identityAddress), client)
    // Generate address
    addr, addrPvt, err := generateNewAddress()
    // Check errors
    if err != nil {
        // Elaborate error for the client
        res := simplejson.New()
        res.Set("error", "Cannot Generate New Wallet")
        payload, err := res.MarshalJSON()
        if err != nil {
            log.Println(err)
        }

        w.Header().Set("Content-Type", "application/json")
        w.Write(payload)
        return
    }
    // Encode name
    params := mux.Vars(r)
    name := params["name"]
    name32 := [32]byte{}
    copy(name32[:], []byte(name))
    // Get nonce
    nonce, err := client.PendingNonceAt(context.Background(), common.HexToAddress(serverAddress))
    if err != nil {
        // Elaborate error for the client
        res := simplejson.New()
        res.Set("error", "cannot reach the client")
        payload, err := res.MarshalJSON()
        if err != nil {
            log.Println(err)
        }

        w.Header().Set("Content-Type", "application/json")
        w.Write(payload)
        return
    }
    // Get gas price
    gasPrice, _ := client.SuggestGasPrice(context.Background())
    if err != nil {
        // Elaborate error for the client
        res := simplejson.New()
        res.Set("error", "cannot reach the client")
        payload, err := res.MarshalJSON()
        if err != nil {
            log.Println(err)
        }

        w.Header().Set("Content-Type", "application/json")
        w.Write(payload)
        return
    }
    // Transaction Object
    serverECDSA, _ := crypto.HexToECDSA(serverPvt)
    auth := bind.NewKeyedTransactor(serverECDSA)
    auth.Nonce = big.NewInt(int64(nonce))
    auth.Value = big.NewInt(0)     // in wei
    auth.GasLimit = uint64(300000) // in units
    auth.GasPrice = gasPrice
    addrObj := common.HexToAddress(addr)
    //  Verify if the tx would be successful
    owner, _ := identityContract.Owner(&bind.CallOpts{})
    if owner != common.HexToAddress(serverAddress) {
        log.Fatal(errors.New("This server doesn't own the contract"))
    }
    exist, _ := identityContract.AddressOf(&bind.CallOpts{}, name32)
    if exist != common.HexToAddress("0x0") {
        // Elaborate error for the client
        res := simplejson.New()
        res.Set("error", "username already picked")
        payload, err := res.MarshalJSON()
        if err != nil {
            log.Println(err)
        }

        w.Header().Set("Content-Type", "application/json")
        w.Write(payload)
        return
    }
    // Send tx
    identityContract.Register(auth, addrObj, name32)
    // Elaborate response for the client
    res := simplejson.New()
    res.Set("address", addr)
    res.Set("pvt", addrPvt)
    payload, err := res.MarshalJSON()
    if err != nil {
        log.Println(err)
    }

    w.Header().Set("Content-Type", "application/json")
    w.Write(payload)
    return
}

func queryName (w http.ResponseWriter, r *http.Request) {
    //Allow CORS here By * or specific origin
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
    log.Println("Received query");
    client, _ := ethclient.Dial("https://rinkeby.infura.io")
    identityContract, _ := identity.NewIdentity(common.HexToAddress(identityAddress), client)
    params := mux.Vars(r)
    address := params["address"]
    // Elaborate response for the client
    res := simplejson.New()
    name, _ := identityContract.NameOf(&bind.CallOpts{}, common.HexToAddress(address))
    bytesName := bytes.Trim(name[:], "\u0000")
    res.Set("name", string(bytesName))
    payload, err := res.MarshalJSON()
    if err != nil {
        log.Println(err)
    }

    w.Header().Set("Content-Type", "application/json")
    w.Write(payload)
    return
}

func queryAddress (w http.ResponseWriter, r *http.Request) {
    //Allow CORS here By * or specific origin
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
    log.Println("Received query");
    client, _ := ethclient.Dial("https://rinkeby.infura.io")
    identityContract, _ := identity.NewIdentity(common.HexToAddress(identityAddress), client)
    params := mux.Vars(r)
    name := params["name"]
    name32 := [32]byte{}
    copy(name32[:], []byte(name))
    // Elaborate response for the client
    res := simplejson.New()
    address, _ := identityContract.AddressOf(&bind.CallOpts{}, name32)
    res.Set("address", address.String())
    payload, err := res.MarshalJSON()
    if err != nil {
        log.Println(err)
    }

    w.Header().Set("Content-Type", "application/json")
    w.Write(payload)
    return	
}


