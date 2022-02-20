/* eslint no-control-regex: "off", no-unused-vars: ["error", { "varsIgnorePattern": "stdout*" }] */
const fs = require("fs");
const winston = require('winston');

const blinkiegen = require('./blinkiegen.js')
const blinkieData = require('./blinkieData.js')


const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

function cleanBlinkieID(str) {
    return str.replace(/[^a-zA-Z0-9-.]/g, '');
}

const pourBlinkie = async function (req, res) {
    const style = req.body.blinkieStyle;
    const intext = req.body.blinkieText;
    const scale = parseInt(req.body.blinkieScale) ? parseInt(req.body.blinkieScale) : 1;

    res.set('Content-Type', 'application/json');
    res.set('Access-Control-Allow-Origin','*')
    blinkiegen.pour(style, intext, scale).then(function(blinkieLink) {
        res.end(blinkieLink);
    });

    if (intext.substring(0,5) != 'nolog') {
        logger.info({
            mtype: 'pour',
            parms: {
                origin: req.get('origin'),
                scale:  scale,
                style:  style,
                text:   intext,
                time:   Date.now()
            }
        });
    }
}

const serveArchive = function (req, res) {
    res.render('pages/archive.ejs', {
        sourceList: blinkieData.sourceList,
        fontList: blinkieData.fontList
    });
}

const serveBlinkie = function (req, res) {
    let defaultPath = global.appRoot + "/public/blinkies-public/display/blinkiesCafe.gif";
    try {
        const blinkieID = cleanBlinkieID(req.params['blinkieID']);
        var reqPath = global.appRoot + "/public/blinkies-public/" + blinkieID;
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
    let pourStyle = String(req.query.s) in blinkieData.styleList ? String(req.query.s) : '';
    res.render('pages/gallery.ejs', { pourStyle: pourStyle, styleList: blinkieData.stylePage });
}

const servePour = function (req, res) {
    let defaultStyleIndex = String(req.query.s) in blinkieData.styleList ? String(req.query.s) : '0007-chocolate';
    res.render('pages/pour.ejs', {
        defaultStyleKey: defaultStyleIndex,
        styleList: blinkieData.styleList
    });
}

const serveStyleList = function (req, res) {
    res.contentType("application/json");
    res.set('Access-Control-Allow-Origin','*')
    res.send(JSON.stringify(blinkieData.styleList));
}

module.exports = {
    serveBlinkie,
    serveGallery,
    serveStyleList,
    serveArchive,
    pourBlinkie,
    servePour
}
