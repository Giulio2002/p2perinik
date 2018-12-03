package main

import "math/rand"
import "time"

const letterSalt = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func genSalt(n int) string {
	rand.Seed(time.Now().UTC().UnixNano())
    b := make([]byte, n)
    for i := 0; i < n; i++ {
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