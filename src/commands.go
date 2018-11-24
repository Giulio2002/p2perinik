package main

import (
  "math/rand"
  "crypto/sha256"
  "strconv"
  "fmt"
  "strings"
)

func deposit(args []string) int {
	if len(args) != 1 {
		return 2
	}
	args[0] = strings.Replace(args[0], " ", "", 9999)
	_, err := strconv.Atoi(args[0])

	if err != nil {
		return 2
	}

	secret := sha256.Sum256([]byte(strconv.Itoa(rand.Int())))
	// callContract()
	rw.WriteString(fmt.Sprintf("%s\n", secret))
	rw.Flush()
	return 0
}
