/******************************************************************************
 * Copyright (c) 2018-19 Giulio Rebuffo
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License version 2
 * as published by the Free Software Foundation; or, when distributed
 * separately from the Linux kernel or incorporated into other
 * software packages, subject to the following license:
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this source file (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
#include "post.h"
     
char * POST(char * host, char * path, int port) {
    // Setup     
    char * request = malloc(sizeof(char) * 500);
    struct hostent *server;
    struct sockaddr_in serveraddr; 
    int tcpSocket = socket(AF_INET, SOCK_STREAM, 0);
    // Check errors 
    if (tcpSocket < 0)
        return "Error opening socket";
    // gethostbyname
    server = gethostbyname(host);
    // check for errors
    if (server == NULL)
    {
        return "gethostbyname() failed\n";
    }
    // Establish a connection and check for errors
    bzero((char *) &serveraddr, sizeof(serveraddr));
    serveraddr.sin_family = AF_INET;
    bcopy((char *)server->h_addr, (char *)&serveraddr.sin_addr.s_addr, server->h_length);     
    serveraddr.sin_port = htons(port);
    if (connect(tcpSocket, (struct sockaddr *) &serveraddr, sizeof(serveraddr)) < 0)
        printf("\nError Connecting");
    else
        printf("\nSuccessfully Connected");
    // Create GET request
    bzero(request, 1000);
    sprintf(request, "POST %s HTTP/1.1\r\nHost: %s\r\n\r\n", path, host);
    printf("\n%s", request);
    // Send GET REQUEST 
    if (send(tcpSocket, request, strlen(request), 0) < 0)
        printf("Error with send()");
    else
        printf("Successfully sent html fetch request");
    // Retrieve response 
    bzero(request, 1000);
    recv(tcpSocket, request, 999, 0);
    close(tcpSocket);
    // return result 
    return request;
}

