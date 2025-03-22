/* eslint no-control-regex: "off", no-unused-vars: ["error", { "varsIgnorePattern": "stdout*" }] */
const express = require('express');
const router = express.Router();
const fs = require("fs");
const controller = require('./controller.js');
const middleware = require('./middleware.js');

// pages
router.get("/", controller.serveCafe);
router.get("/pour", controller.servePour);
router.get("/archive", controller.serveArchive);
router.get("/submitters", controller.serveSubmitters);
router.get("/feed", controller.serveFeed);
router.get("/wall", controller.serveWall);
router.get("/blog", function(req,res){
    res.render('pages/blog.ejs');
})
router.get("/halloween", controller.serveHalloween);
router.get("/blog/:post", function(req,res){
    try {
        const blogpost = middleware.noSpecials(req.params['post'].toString());
        const reqPath = global.appRoot + "/views/pages/blog/" + blogpost + '.ejs';
        fs.access(reqPath, fs.constants.F_OK, (err) => {
            if (!err) { res.render('pages/blog/' + blogpost + '.ejs'); }
            else { res.status(404).render('pages/e404.ejs'); }
        });
    }
    catch {
        res.status(404).render('pages/e404.ejs');
    }
});

// blinkies
router.get('/b/:blinkieID', middleware.blockHotlinking, controller.serveBlinkie);
router.use('/b/display/', express.static("public/blinkies-public/display/", { maxAge: '365d' }));

// api
router.options("/api/pour", function(req, res){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.sendStatus(200);
});
router.post("/api/pour", controller.pourBlinkie);

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
    res.sendFile(global.appRoot + "/public/txt/sitemap.txt");
});
router.get("/privacy.txt", function (req, res) {
    res.sendFile(global.appRoot + "/public/txt/privacy.txt");
});
router.get("/robots.txt", function (req, res) {
    res.sendFile(global.appRoot + "/public/txt/robots.txt");
});

// error codes
router.use(function(req,res){
    res.status(404).render('pages/e404.ejs');
});

module.exports = router;
