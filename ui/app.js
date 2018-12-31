var express = require('express');
var app = express();
var path = require('path');

// viewed at http://localhost:4200
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/interface/index.html'));
});

app.get('/login', function(req, res) {
    res.sendFile(path.join(__dirname + '/interface/login.html'));
});

app.get('/home', function(req, res) {
    res.sendFile(path.join(__dirname + '/interface/home.html'));
});

app.get('/user.png', function(req, res) {
    res.sendFile(path.join(__dirname + '/interface/user.png'));
});

app.get('/loading.gif', function(req, res) {
    res.sendFile(path.join(__dirname + '/interface/loading.gif'));
});

app.get('/router.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/interface/router.js'));
});

app.get('/index.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/interface/index.js'));
});

app.get('/index.wasm', function(req, res) {
    res.sendFile(path.join(__dirname + '/interface/index.wasm'));
});

app.listen(4200);