/* eslint no-control-regex: "off", no-unused-vars: ["error", { "varsIgnorePattern": "stdout*" }] */
const fs = require("fs");

const blinkiegen  = require('./blinkiegen.js');
const blinkieData = require('./blinkieData.js');
const blacklist   = require('./blacklist.js');
const logger      = require('./logger.js').logger;

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvw'
                         + 'xyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random()*charactersLength));
    }
    return result;
}

function cleanBlinkieID(str) {
    return str.replace(/[^a-zA-Z0-9-.]/g, '');
}

let recentRequests = [];
function cooldown(ip) {
    const currentTime = Date.now();
    let allowed       = false;
    let ipsOnCooldown = [];

    // remove requests older than 1 sec from recentRequests,
    // add newer requests to IPs on cooldown.
    for (let i=recentRequests.length-1; i>=0; i--) {
        if (recentRequests[i][1] < currentTime - 2000) {
            recentRequests.shift();
        }
        else {
            ipsOnCooldown.push(recentRequests[i][0]);
        }
    }

    // if current requester ip is not on cooldown, add to recentRequests,
    // and allow the current request.
    if (!ipsOnCooldown.includes(ip)) {
        recentRequests.push([ip, Date.now()]);
        allowed = true;
    }

    if (!global.prod) {
        allowed = true;
    }

    return allowed;
}

const msg = async function (req, res) {
    if (cooldown(req.ip)) {
        logger.info({
            time:  Date.now(),
            mtype: 'msg',
            details: {
                origin: req.get('origin'),
                msg: req.body.msg
            }
        });
        res.end("ty");
    }
}

function profane(intext) {
    const words = intext.toLowerCase().split(/[^A-Za-z]/);
    const profane = words.some(r=> blacklist.words.includes(r))
    return profane;
}

const queue = require('promise-queue')
var brueue = new queue(1, Infinity);
var recentBlinkies = [];
var orderBlinkie = function(res, style, intext, scale, split, toFeed)
{
    var promise = new Promise((resolve) => {
        // generate unique blinkie ID & URL.
        let blinkieIDassigned = false;
        let blinkieID = makeid(2);
        let blinkieLink = '/b/blinkiesCafe-' + blinkieID + '.gif';
        while (!blinkieIDassigned) {
            if (!recentBlinkies.includes(blinkieLink)) {
                blinkieIDassigned = true;
            }
            else {
                blinkieID = makeid(2);
                blinkieLink = '/b/blinkiesCafe-' + blinkieID + '.gif';
            }
        }
        blinkiegen.pour(blinkieID, style, intext, scale, split).then(function(blinkieLink) {
            res.end(blinkieLink);
            resolve(blinkieLink);
            if (toFeed) {
                if (!profane(intext)) {
                    recentBlinkies.unshift(blinkieLink);
                    if (recentBlinkies.length > 18) recentBlinkies.pop();
                }
            }
        });
    })
    return promise;
}

const pourBlinkie = async function (req, res) {
    if (cooldown(req.ip)) {
        const style  = req.body.blinkieStyle;
        const origintext = req.body.blinkieText;
        let intext   = req.body.blinkieText;
        const scale  = parseInt(req.body.blinkieScale) ? parseInt(req.body.blinkieScale) : 1;
        const split = Boolean(req.body.splitText);
        const toFeed = Boolean(req.body.toFeed);
        const starttime = Date.now();

        if (origintext.substring(0,7) == '/nolog ') {
            intext = origintext.replace('/nolog ', '');
        }

        res.set('Content-Type', 'application/json');
        res.set('Access-Control-Allow-Origin','*')

        await brueue.add(orderBlinkie.bind(null, res, style, intext, scale, split, toFeed));

        if (origintext.substring(0,7) != '/nolog ') {
            logger.info({
                time:    starttime,
                orderMs: Date.now() - starttime,
                mtype:   'pour',
                origin:  req.get('origin'),
                parms: {
                    scale:  scale,
                    style:  style,
                    text:   intext,
                    split:  split,
                    toFeed: toFeed
                }       // parms
            });         // logger.info
        }               // nolog
    }                   // cooldown
}

const serveArchive = function (req, res) {
    res.render('pages/archive.ejs', {
        sourceList: blinkieData.sourcePage,
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

const serveCafe = function (req, res) {
    let pourStyle = String(req.query.s) in blinkieData.styleList ? String(req.query.s) : '';
    res.setHeader(
        'Content-Security-Policy',
        "script-src 'self'"
    )
    res.render('pages/cafe.ejs', { pourStyle:pourStyle, styleList:blinkieData.styleList, stylePage:blinkieData.stylePage });
}

const servePour = function (req, res) {
    let defaultStyleIndex = String(req.query.s) in blinkieData.styleProps ? String(req.query.s) : '0007-chocolate';
    res.render('pages/pour.ejs', {
        defaultStyleKey: defaultStyleIndex,
        styleList: blinkieData.styleProps
    });
}

const serveFeed = function (req, res) {
    let warn = Boolean(req.query.warn);
    res.render('pages/feed.ejs', {
        warn: warn,
        recentBlinkies: recentBlinkies
    });
}

const serveSitemap = function (req, res) {
    const displayBaseUrl = 'https://blinkies.cafe/b/display/';
    res.contentType("text/plain");
    try {
        fs.readFile(global.appRoot + '/views/pages/sitemap.txt', 'utf8' , (err, sitemap) => {
            if (err) {
                res.send(sitemap);
                return
            }
            Object.keys(blinkieData.styleList).forEach(function(key) {
                sitemap += displayBaseUrl + key.toString() + '.gif\n';
            });
            res.send(sitemap);
        })
    }
    catch {
        res.sendFile(global.appRoot + "/views/pages/sitemap.txt");
    }
}

const serveSourceList = function (req, res) {
    res.contentType("application/json");
    res.set('Access-Control-Allow-Origin','*')
    res.send(JSON.stringify(blinkieData.sourceList));
}

const serveStyleList = function (req, res) {
    res.contentType("application/json");
    res.set('Access-Control-Allow-Origin','*')
    res.send(JSON.stringify(blinkieData.styleList));
}

module.exports = {
    msg,
    serveBlinkie,
    serveCafe,
    serveSitemap,
    serveSourceList,
    serveStyleList,
    serveArchive,
    pourBlinkie,
    servePour,
    serveFeed
}
