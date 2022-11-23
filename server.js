/* eslint no-control-regex: "off", no-unused-vars: ["error", { "varsIgnorePattern": "stdout*" }] */

// Runtime parameters
global.prod = (process.env.NODE_ENV === "production") ? true : false;

// Requires
require('ejs');
var express = require("express");
var app = express();
var compression = require('compression');
var minify = require('express-minify');
var path = require('path');
const helmet = require("helmet");
const fs = require("fs");
const router = require('./src/routes.js');

const options = global.prod ? {
  key: fs.readFileSync('certs/privkey1.pem'),
  cert: fs.readFileSync('certs/fullchain1.pem')
} : {};
const https = global.prod ? require("https").createServer(options, app)
                   : require("http").createServer(app);

app.set('view engine', 'ejs');
app.use(compression());
if (global.prod) { app.use(minify()); }
app.use(express.json());
app.use(helmet());
app.use('/', router);

global.appRoot = path.resolve(__dirname);

https.listen(8080, function () {
    console.log("https listening on *:8080\n");
});

if (global.prod) {
    // Redirect from http port 80 to https
    var http  = require("http");
    http.createServer(function (req, res) {
        res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
        res.end();
    }).listen(3000);
}
