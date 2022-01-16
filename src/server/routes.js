/* eslint no-control-regex: "off", no-unused-vars: ["error", { "varsIgnorePattern": "stdout*" }] */
const express = require('express');
const router = express.Router();
const controller = require('./controller.js')

router.get("/", controller.serveGallery);

router.get("/pour", controller.servePour);

router.get("/about", function (req, res) {
    res.sendFile(global.appRoot + "/views/pages/about.html");
});


router.get("/sitemap.txt", function (req, res) {
    res.sendFile(global.appRoot + "/views/pages/sitemap.txt");
});

router.get("/sources", controller.serveSources);

router.get("/privacy.txt", function (req, res) {
    res.sendFile(global.appRoot + "/views/pages/privacy.txt");
});

router.get("/styleList.json", controller.serveStyleList);

router.get("/pour.js", function (req, res) {
    res.sendFile(global.appRoot + "/src/client/pour.js");
});

router.get("/blinkieSources.js", function (req, res) {
    res.sendFile(global.appRoot + "/src/client/blinkieSources.js");
});

router.get('/b/display/:blinkieID', controller.serveDisplayBlinkie);

router.get('/b/:blinkieID', controller.serveBlinkie);

router.get('/favicon.ico', function (req, res) {
    res.sendFile(global.appRoot + "/assets/favicon.ico");
});

router.post("/api/pour", controller.pourBlinkie);

router.options("/styleList.json", function(req, res){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.sendStatus(200);
});

router.options("/api/pour", function(req, res){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.sendStatus(200);
});

router.get("/robots.txt", function (req, res) {
    res.sendFile(global.appRoot + "/robots.txt");
});

router.use(function(req,res){
    res.status(404).sendFile(global.appRoot + "/views/pages/e404.html");
});

module.exports = router;
