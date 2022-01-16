/* eslint no-control-regex: "off", no-unused-vars: ["error", { "varsIgnorePattern": "stdout*" }] */
const fs = require("fs");
const pour = require('./pour.js')
const data = require('./data.js')
const timeGenBlinkie = false;

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
    res.render('pages/gallery.ejs', { styleList: data.styleList });
}

const serveStyleList = function (req, res) {
    res.contentType("application/json");
    res.set('Access-Control-Allow-Origin','*')
    res.send(JSON.stringify(data.styleList));
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
    let defaultStyleIndex = parseInt(req.query.s) in data.styleList ? parseInt(req.query.s) : 1;
    res.render('pages/pour.ejs', {
        defaultStyleKey: defaultStyleIndex,
        styleList: data.styleList
    });
}

const serveSources = function (req, res) {
    res.render('pages/sources.ejs', {
        sourceList: data.sourceList,
        fontList: data.fontList
    });
}


module.exports = {
    serveBlinkie,
    serveGallery,
    serveStyleList,
    serveSources,
    pourBlinkie,
    servePour
}
