/* eslint no-control-regex: "off", no-unused-vars: ["error", { "varsIgnorePattern": "stdout*" }] */
const express = require('express');
const router = express.Router();
const controller = require('./controller.js')

// pages
router.get("/", controller.serveGallery);
router.get("/pour", controller.servePour);
router.get("/archive", controller.serveArchive);
router.get("/sources", function(req,res){
    res.redirect(301, '/archive');
});
router.get("/about", function(req,res){
    res.redirect(301, '/');
});

// blinkies
router.get('/b/:blinkieID', controller.serveBlinkie);
router.use('/b/display/', express.static("assets/blinkies-public/display/"))

// api
router.options("/api/pour", function(req, res){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.sendStatus(200);
});
router.post("/api/pour", controller.pourBlinkie);

// client scripts & data
router.use(express.static("src/client/"))
router.options("/styleList.json", function(req, res){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.sendStatus(200);
});
router.get("/styleList.json", controller.serveStyleList);

// favicon
router.get('/favicon.ico', function (req, res) {
    res.sendFile(global.appRoot + "/assets/favicon.ico");
});

// raw text
router.use('/sitemap.txt', function (req, res) {
    res.sendFile(global.appRoot + "/views/pages/sitemap.txt");
});
router.get("/privacy.txt", function (req, res) {
    res.sendFile(global.appRoot + "/views/pages/privacy.txt");
});
router.get("/robots.txt", function (req, res) {
    res.sendFile(global.appRoot + "/robots.txt");
});

// error codes
router.use(function(req,res){
    res.status(404).sendFile(global.appRoot + "/views/pages/e404.html");
});

module.exports = router;
