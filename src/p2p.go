package main

import (
	"bufio"
	"fmt"
	"log"
	"time"
	"github.com/libp2p/go-libp2p-host"
	"github.com/libp2p/go-libp2p-net"
	"github.com/libp2p/go-libp2p-peer"
	"github.com/libp2p/go-libp2p-peerstore"
	"github.com/multiformats/go-multiaddr"
	"os"
	"strings"
)

var rw *bufio.ReadWriter;
var keys = make([]string, 0);

func addAddrToPeerstore(h host.Host, addr string) peer.ID {
	maddr, err := multiaddr.NewMultiaddr(addr)
	if err != nil {
		log.Fatalln(err)
	}

	info, err := peerstore.InfoFromP2pAddr(maddr)
	if err != nil {
		log.Fatalln(err)
	}

	h.Peerstore().AddAddrs(info.ID, info.Addrs, peerstore.PermanentAddrTTL)
	return info.ID
}

func handleStream(s net.Stream) {
	log.Println("Got a new stream!")

	// Create a buffer stream for non blocking read and write.
	rw = bufio.NewReadWriter(bufio.NewReader(s), bufio.NewWriter(s))

	go readData(rw)
	go commandline(rw)
	time.Sleep(1)
	sendData("/a" + CoinBaseAddress);

	// stream 's' will stay open until you close it (or the other side closes it).
}

func readData(rw *bufio.ReadWriter) {
	for {
		defer fmt.Println("Dead")
		str, _ := rw.ReadString('\n')
		if str != "\n" {
			time.Sleep(1);
			/* 
			* Green console colour: 	\x1b[32m
			* Reset console colour: 	\x1b[0m 
			*/
			
			// In case we recognize the message as new deposit
			if strings.Index(str, "/d") == 0 {
				tmp := make([]string, len(keys) + 1)
				copy(tmp, keys);
				tmp[len(tmp) - 1] = strings.Replace(str, "/d", "", 1)
				keys = tmp;
				// print message
				fmt.Printf("\x1b[32mReceived deposit: %s. for withdraw, digit: withdraw(%d)\x1b[0m> ", strings.Replace(str, "/d", "", 1), len(keys))
			} else if strings.Index(str, "/a") == 0 && PeerAddress == "" {
				// parse peer address
				peer := strings.Replace(str, "\n", "", 9999)
				// we set peer address
				PeerAddress = strings.Replace(peer, "/a", "", 1)
				// we share our coinbase address with the other peer
				sendData("/a" + CoinBaseAddress);
			} else {
				fmt.Printf("\x1b[32m%s\x1b[0m> ", str)
			}
		}

	}
}

func commandline(rw *bufio.ReadWriter) {
	stdReader := bufio.NewReader(os.Stdin)

	for {
		fmt.Print("> ")
		sendData, err := stdReader.ReadString('\n')

		if err != nil {
			panic(err)
		}
		cmd := newCommand(sendData)
		cmd.execute();
	}
}