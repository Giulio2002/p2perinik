package main

import "math/rand"
import "time"

const letterSalt = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func genKey(base string) (string, uint8) {
	l := len(base)
    rand.Seed(time.Now().UTC().UnixNano())
    bytes := make([]byte, l)
    specialIndex := randInt(2, uint8(l-1))
    bytes[0] = byte(0x0)
    bytes[1] = byte(0x0)
    for i := 2; i < l; i++ {
        bytes[i] = byte(randInt(0, 255))
    }
    return string(bytes), uint8(bytes[specialIndex])
}

func randInt(min uint8, max uint8) uint8 {
    return min + uint8(rand.Intn(int(max-min)))
}