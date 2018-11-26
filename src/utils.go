package main

import "math/rand"

const letterSalt = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func genSalt(n int) string {
    b := make([]byte, n)
    for i := range b {
        b[i] = letterSalt[rand.Intn(len(letterSalt))]
    }
    return string(b)
}

func genSk() string {
	return "0x" + genSalt(64)
}

func genNullifier(receiver string) string {
	return receiver + genSalt(24)
}