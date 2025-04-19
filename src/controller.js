/* eslint no-control-regex: "off", no-unused-vars: ["error", { "varsIgnorePattern": "stdout*" }] */

const fs = require("fs");

const blinkiegen  = require('./blinkiegen.js');
const blinkieData = require('./data/blinkieData.js');
const subData     = require('./data/subData.js');
const fontData    = require('./data/fontData.js');
const logger      = require('./logger.js').logger;
const middleware  = require('./middleware.js');
const siteURL = global.prod ? 'https://blinkies.cafe' : '';
let blacklist = {ips: [], words: []};
try { blacklist = require('./data/blacklist.js'); }
catch { console.log('blacklist.js not found; using empty lists'); }

function sortObj(obj) {
    return Object.keys(obj).sort().reduce(function (result, key) {
      result[key] = obj[key];
      return result;
    }, {});
}

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

function profane(intext) {
    const intextAlpha = intext
        .toLowerCase()
        .replaceAll('3','e').replaceAll('1','i').replaceAll('4','a')
        .replaceAll(/[^a-z]/g,'');
    const profane = blacklist.words.some(v => intextAlpha.includes(v));
    return profane;
}

const queue = require('promise-queue')
var brueue = new queue(1, Infinity);
var recentBlinkies = [];
/**
 * Handles the creation of a blinkie and returns a promise that resolves with the generated blinkie ID.
 *
 * @param {Object} res - The HTTP response object used to send the generated blinkie URL.
 * @param {string} style - The style of the blinkie to be generated.
 * @param {string} font - The font to be used in the blinkie.
 * @param {string} intext - The text to be displayed on the blinkie.
 * @param {number} scale - The scale factor for the blinkie size.
 * @param {boolean} split - Whether the text should be split across multiple lines.
 * @param {boolean} toFeed - Whether the generated blinkie should be added to the recent blinkies feed.
 * @returns {Promise<string>} A promise that resolves with the unique ID of the generated blinkie.
 */
var orderBlinkie = function(res, style, font, intext, scale, split, toFeed)
{

    var promise = new Promise((resolve) => {
        // generate unique blinkie ID
        let blinkieIDassigned = false;
        let blinkieID = makeid(2);
        let recentIDs = recentBlinkies.map(a => a.blinkieID);
        while (!blinkieIDassigned) {
            if (!recentIDs.includes(blinkieID)) blinkieIDassigned = true;
            else blinkieID = makeid(2);
        }
        blinkiegen.pour(blinkieID, style, font, intext, scale, split).then(function(newBlinkieID) {
            res.end(siteURL + '/b/blinkiesCafe-' + newBlinkieID + '.gif');
            resolve(newBlinkieID);
            if (toFeed) {
                if (!profane(intext)) {
                    recentBlinkies.unshift({blinkieID:newBlinkieID,style:style});
                    if (recentBlinkies.length > 18) recentBlinkies.pop();
                }
            }
        });
    })
    return promise;
}

const pourBlinkie = async function (req, res) {
    if (cooldown(req.ip) && !blacklist.ips.includes(req.ip)) {
        const style      = typeof req.body.blinkieStyle == 'string' ? req.body.blinkieStyle : '0121-blinkiescafe';
        const origintext = typeof req.body.blinkieText == 'string' ? req.body.blinkieText : '';
        let intext       = typeof req.body.blinkieText == 'string' ? req.body.blinkieText : '';
        const scale      = (typeof req.body.blinkieScale == 'number' || typeof req.body.blinkieScale == 'string') ? parseInt(req.body.blinkieScale) : 1;
        const split      = typeof req.body.splitText == 'boolean' ? req.body.splitText : false;
        const toFeed     = typeof req.body.toFeed == 'boolean' ? req.body.toFeed : false;
        const font       = typeof req.body.blinkieFont == 'string' ? req.body.blinkieFont : 'auto';
        const starttime  = Date.now();

        if (origintext.substring(0,7) == '/nolog ') {
            intext = origintext.replace('/nolog ', '');
        }

        res.set('Content-Type', 'application/json');
        res.set('Access-Control-Allow-Origin','*')

        await brueue.add(orderBlinkie.bind(null, res, style, font, intext, scale, split, toFeed));

        if (origintext.substring(0,7) != '/nolog ') {
            logger.info({
                time:    starttime,
                orderMs: Date.now() - starttime,
                mtype:   'pour',
                origin:  req.get('origin'),
                ip:      req.ip,
                parms: {
                    scale:  scale,
                    style:  style,
                    font:   font,
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
        fonts: fontData.fonts
    });
}

let submitters = sortObj(subData.submitters);
for (let [styleKey, styleData] of Object.entries(blinkieData.styleProps)) {
    if (!styleData.sub) submitters['amy'].templates.push(styleKey);
    else if (styleData.sub in subData.submitters) 
        submitters[styleData.sub].templates.push(styleKey);
}

const serveSubmitters = function (req, res) {
    const freeze = Boolean(req.query.freeze);
    res.render('pages/submitters.ejs', {
        freeze: freeze,
        submitters: submitters,
        styleList: blinkieData.styleList
    });
}

const serveBlinkie = function (req, res) {
    let defaultPath = global.appRoot + "/public/blinkies-public/display/blinkiesCafe.gif";
    try {
        const blinkieID = middleware.noSpecials(req.params['blinkieID']);
        const reqPath = global.appRoot + "/public/blinkies-public/" + blinkieID;
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
    let freeze = Boolean(req.query.freeze);
    res.setHeader(
        'Content-Security-Policy',
        "script-src 'self'"
    )
    res.render('pages/cafe.ejs', { pourStyle:pourStyle, styleList:blinkieData.styleList, stylePage:blinkieData.stylePage, fonts:fontData.fonts, freeze:freeze });
}

const serveWall = function (req, res) {
    const freeze = Boolean(req.query.freeze);
    const query  = req.query.q ? middleware.noSpecials(String(req.query.q)) : '';
    res.setHeader(
        'Content-Security-Policy',
        "script-src 'self'"
    )
    res.render('pages/wall.ejs', { styleList:blinkieData.styleList, query:query, freeze:freeze });
}

const servePour = function (req, res) {
    let defaultStyleIndex = String(req.query.s) in blinkieData.styleProps ? String(req.query.s) : '0007-chocolate';
    res.render('pages/pour.ejs', {
        defaultStyleKey: defaultStyleIndex,
        styleList: blinkieData.styleProps,
        fonts:fontData.fonts
    });
}

const serveFeed = function (req, res) {
    let warn = Boolean(req.query.warn);
    res.render('pages/feed.ejs', {
        warn: warn,
        recentBlinkies: recentBlinkies
    });
}

const serveHalloween = function (req, res) {
    res.set('Access-Control-Allow-Origin','*');
    res.setHeader("Content-Security-Policy", "frame-ancestors *");
    let defaultStyleKey = String(req.query.s) in blinkieData.styleProps ? String(req.query.s) : '';
    res.render('pages/halloween.ejs', {
        defaultStyleKey: defaultStyleKey,
        styleList: blinkieData.styleProps,
        fonts:fontData.fonts
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
    serveBlinkie,
    serveCafe,
    serveSitemap,
    serveSourceList,
    serveStyleList,
    serveArchive,
    serveSubmitters,
    pourBlinkie,
    servePour,
    serveFeed,
    serveWall,
    serveHalloween
}
