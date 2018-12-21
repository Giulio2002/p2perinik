package main

import (
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

	miximusDeposit();
	return 0
}

func send(args []string) int {
	if len(args) != 1 {
		return 2
	}

	rw.WriteString(fmt.Sprintf("%s\n", args[0]))
	rw.Flush()
	return 0
}

func withdraw(args []string) int {
	args[0] = strings.Replace(args[0], " ", "", 9999)
	fmt.Println(len(args))
	if len(args) != 1 {
		return 2
	}
	index, err := strconv.Atoi(args[0])
	if err != nil {
		return 2
	}

	success := p2perinikWithdraw(keys[index - 1])
	if (success) {
		return 0	
	} else {
		return 3
	}

}
