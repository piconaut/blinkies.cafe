/* eslint no-control-regex: "off", no-unused-vars: ["error", { "varsIgnorePattern": "stdout*" }] */
const express = require('express');
const router = express.Router();
const controller = require('./controller.js')

// pages
router.get("/", controller.serveCafe);
router.get("/pour", controller.servePour);
router.get("/archive", controller.serveArchive);
router.get("/sources", function(req,res){
    res.redirect(301, '/archive');
});
router.get("/about", function(req,res){
    res.redirect(301, '/');
});
router.get("/wall", function(req,res){
    res.setHeader(
        'Content-Security-Policy',
        "img-src 'self' https://blinkies.neocities.org"
    );
    res.sendFile(global.appRoot + "/views/pages/wall.html");
})
router.get("/blog", function(req,res){
    res.render('pages/blog.ejs');
})
router.get("/blog/:post", function(req,res){
    res.render('pages/blog/' + req.params['post'] + '.ejs');
})

// blinkies
router.get('/b/:blinkieID', controller.serveBlinkie);
router.use('/b/display/', express.static("public/blinkies-public/display/", { maxAge: '365d' }));

// api
router.options("/api/pour", function(req, res){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.sendStatus(200);
});
router.post("/api/pour", controller.pourBlinkie);
router.post("/api/msg", controller.msg);

// static files
router.use(express.static("public/static/css/"));
router.use(express.static("public/static/js/"));
router.use(express.static("public/static/img/", { maxAge: '365d' }));

// json data
router.options("/styleList.json", function(req, res){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.sendStatus(200);
});
router.get("/styleList.json", controller.serveStyleList);
router.get("/sourceList.json", controller.serveSourceList);

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
    res.status(404).render('pages/e404.ejs');
});

module.exports = router;
