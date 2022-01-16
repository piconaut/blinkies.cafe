/* eslint no-control-regex: "off", no-unused-vars: ["error", { "varsIgnorePattern": "stdout*" }] */

// Runtime parameters
global.prod = (process.env.NODE_ENV === "production") ? true : false;

require('ejs');
var express = require("express");
var app = express();
app.set('view engine', 'ejs');
const helmet = require("helmet");
const fs = require("fs");
const options = global.prod ? {
  key: fs.readFileSync('certs/privkey2.pem'),
  cert: fs.readFileSync('certs/fullchain2.pem')
} : {};
const https = global.prod ? require("https").createServer(options, app)
                   : require("http").createServer(app);

const router = require('./src/server/routes.js')

app.use(express.json());
app.use(helmet());
app.use('/', router);

var path = require('path');
global.appRoot = path.resolve(__dirname);

https.listen(8080, function () {
    console.log("https listening on *:8080\n");
});

if (global.prod) {
    // Redirect from http port 80 to https
    var http  = require("http")
    http.createServer(function (req, res) {
        res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
        res.end();
    }).listen(3000);
}
