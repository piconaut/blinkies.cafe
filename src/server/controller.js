/* eslint no-control-regex: "off", no-unused-vars: ["error", { "varsIgnorePattern": "stdout*" }] */
const fs = require("fs");
const pour = require('./pour.js')
const blinkieData = require('./blinkieData.js')
const timeGenBlinkie = false;

const pourBaseURL = 'https://blinkies.cafe/pour?s=';

function cleanBlinkieID(str) {
    return str.replace(/[^a-zA-Z0-9-.]/g, '');
}

const serveBlinkie = function (req, res) {
    let defaultPath = global.appRoot + "/assets/blinkies-public/display/blinkiesCafe.gif";
    try {
        const blinkieID = cleanBlinkieID(req.params['blinkieID']);
        var reqPath = global.appRoot + "/assets/blinkies-public/" + blinkieID;
        fs.access(reqPath, fs.constants.F_OK, (err) => {
            if (!err) { res.sendFile(reqPath); }
            else { res.sendFile(defaultPath);}
        });
    }
    catch {
        res.sendFile(defaultPath);
    }
}

const serveGallery = function (req, res) {
    res.render('pages/gallery.ejs', { styleList: blinkieData.styleList });
}

const serveStyleList = function (req, res) {
    res.contentType("application/json");
    res.set('Access-Control-Allow-Origin','*')
    res.send(JSON.stringify(blinkieData.styleList));
}

const pourBlinkie = async function (req, res) {
    const style = req.body.blinkieStyle;
    const intext = req.body.blinkieText;

    res.set('Content-Type', 'application/json');
    res.set('Access-Control-Allow-Origin','*')
    pour.genBlinkie(style, intext, timeGenBlinkie).then(function(blinkieLink) {
        res.end(blinkieLink);
    });
}

const servePour = function (req, res) {
    let defaultStyleIndex = parseInt(req.query.s) in blinkieData.styleList ? parseInt(req.query.s) : 1;
    res.render('pages/pour.ejs', {
        defaultStyleKey: defaultStyleIndex,
        styleList: blinkieData.styleList
    });
}

const serveSitemap = function (req, res) {
    res.contentType("text/plain");
    try {
        fs.readFile(global.appRoot + '/views/pages/sitemap.txt', 'utf8' , (err, sitemap) => {
            if (err) {
                res.send(sitemap);
                return
            }
            Object.keys(blinkieData.styleList).forEach(function(key) {
                sitemap += pourBaseURL + key.toString() + '\n';
            });
            res.send(sitemap);
        })
    }
    catch {
        res.sendFile(global.appRoot + "/views/pages/sitemap.txt");
    }
}

const serveArchive = function (req, res) {
    res.render('pages/archive.ejs', {
        sourceList: blinkieData.sourceList,
        fontList: blinkieData.fontList
    });
}


module.exports = {
    serveBlinkie,
    serveGallery,
    serveSitemap,
    serveStyleList,
    serveArchive,
    pourBlinkie,
    servePour
}
