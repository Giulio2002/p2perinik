package main

import (
	"strings"
	"fmt"
)
	
type Command struct {
	name string
    args []string
    err int
}

func newCommand (cmd string) Command {
	// minify command
	strings.Replace(cmd, " " ,"" ,9999)
	// find name
	startArgs := strings.IndexByte(cmd, '(')
	if startArgs == -1 {
		return Command {"", nil, 1}
	}

	name := cmd[0:startArgs]
	// separate raw args from name
	rawArgs := strings.Replace(cmd, name, "", 999)
	rawArgs = strings.Replace(rawArgs, "(", "", 1)
	rawArgs = strings.Replace(rawArgs, ")\n", " ", 1)
	args := strings.Split(rawArgs, ",")
	return Command {name, args, 0}
}

func (c *Command) execute () { 
	if c.err != 0 {
		c.displayError();
		return
	}

	switch (c.name) {
		case "deposit":
			c.err = deposit(c.args)
			break
		case "send":
			c.err = send(c.args)
			break
		default:
			c.err = 404
	}
	c.displayError();
}

func (c *Command) displayError () { 
	switch (c.err) {
		case 1:
			fmt.Printf("\033[1m\033[31m Invalid Syntax\033[0m\n")
		case 2:
			fmt.Printf("\033[1m\033[31m Invalid Arguments\033[0m\n")
		case 404:
			fmt.Printf("\033[1m\033[31m Command not found. see help() for avaible commands\033[0m\n")
	}

}