package main

import (
    "crypto/ecdsa"
    "github.com/ethereum/go-ethereum/common/hexutil"
    "github.com/ethereum/go-ethereum/crypto"
    "errors"
)

func generateNewAddress() (string, string, error) {
    privateKey, err := crypto.GenerateKey()

    if err != nil {
        return "", "", err
    }

    privateKeyBytes := crypto.FromECDSA(privateKey)
    stringifiedPrivateKey := hexutil.Encode(privateKeyBytes)[2:]

    publicKey := privateKey.Public()
    publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
    if !ok {
        return "", "", errors.New("error casting public key to ECDSA")
    }
    address := crypto.PubkeyToAddress(*publicKeyECDSA).Hex()
    return address, stringifiedPrivateKey , nil
}