/* eslint no-control-regex: "off", no-unused-vars: ["error", { "args":"none", "varsIgnorePattern": "std*" }] */
const fs       = require("fs");
const util     = require('util');
const execFile = util.promisify(require('child_process').execFile);
const exec     = util.promisify(require('child_process').exec);

const blinkieData = require('./blinkieData.js')
const logger      = require('./logger.js').logger

const siteURL = global.prod ? 'https://blinkies.cafe' : '';

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

function sanitizeText(str) {
    return (str.substring(0,128) + '')
    .replace(/[\\']/g, '\\$&')
    .replace(/\u0000/g, '\\0')
    .replace(/\ufe0f/g, '')
    .replace(/\u2764/g,'\u2665')
    .replace(/\/heart/g,'\u2665')
    .replace(/\ud83d\udc9a/gu,'\u2665')
    .replace(/\ud83d\udc9b/gu,'\u2665')
    .replace(/\ud83d\udc9c/gu,'\u2665')
    .replace(/\ud83d\udc9d/gu,'\u2665')
    .replace(/\ud83d\udc9e/gu,'\u2665')
    .replace(/\ud83d\udc9f/gu,'\u2665')
    .replace(/\ud83d\udd84/gu,'\u2665')
    .replace(/\ud83d\udc99/gu,'\u2665')
    .replace(/\ud83e\udde1/gu,'\u2665')
    .replace(/\/eheart/g,'\u2661')
    .replace(/\/spade/g,'\u2660')
    .replace(/\/club/g,'\u2663')
    .replace(/\/diamond/g,'\u2666')
    .replace(/\/dia/g,'\u2666');
}

async function processText(blinkieParms) {
    try {
        // get all unicode char codes from string.
        blinkieParms.unicodeCharCodes = '';
        for (var i = 0; i < blinkieParms.cleantext.length; i++) {
            blinkieParms.unicodeCharCodes
            += blinkieParms.cleantext.charCodeAt(i).toString(16) + ' ';
        }

        // if text has chars not in style font, try fallback fonts in order.
        let fontSearch   = "fc-list '" + blinkieParms.font + ":charset="
                         + blinkieParms.unicodeCharCodes + "'";
        let foundFont = await exec(fontSearch);
        if (foundFont.stdout.length == 0) {
            let i = 0;
            let fontFound = false;
            const numFonts = Object.keys(blinkieData.fallbackFonts);
            while (!fontFound && i<numFonts.length) {
                fontSearch = "fc-list '" + blinkieData.fallbackFonts[i].family
                           + ":charset=" + blinkieParms.unicodeCharCodes + "'";
                foundFont  = await exec(fontSearch);
                if (foundFont.stdout.length > 0) {
                    blinkieParms.font      = blinkieData.fallbackFonts[i].family;
                    blinkieParms.antialias = blinkieData.fallbackFonts[i].antialias;
                    blinkieParms.fontsize  = blinkieData.fallbackFonts[i].fontsize;
                    blinkieParms.y         = blinkieData.fallbackFonts[i].y;
                    fontFound = true;
                }
                i ++;
            }
        }

        blinkieParms.cleantext1 = blinkieParms.cleantext;
        blinkieParms.cleantext2 = '';

        // if input text is long & supported by small font, set split flag.
        if (!blinkieParms.split && blinkieParms.cleantext.length > 35) {
            fontSearch = "fc-list '04b03:charset=" + blinkieParms.unicodeCharCodes + "'";
            foundFont  = await exec(fontSearch);
            if (foundFont.stdout.length > 0) blinkieParms.split = true;
        }

        // if split flag is set, split text into two lines.
        if (blinkieParms.split) {
            blinkieParms.antialias = '+antialias';
            blinkieParms.font = '04b03';
            blinkieParms.fontsize = 8;
            blinkieParms.shadow = undefined;
            blinkieParms.y = 4;
            blinkieParms.y2 = -4;

            // if text has spaces, split on space closest to middle.
            if (blinkieParms.cleantext.includes(' ')) {
                const words = blinkieParms.cleantext.split(' ');
                let diff = 99;
                let line1 = '';
                let line2 = '';
                for (let i=0; i<words.length; i++) {
                    line1 = words.slice(0,i+1).join(' ');
                    line2 = words.slice(i+1,words.length+1).join(' ');
                    if ( Math.abs(line1.length - line2.length) < diff ) {
                        diff = Math.abs(line1.length - line2.length);
                        blinkieParms.cleantext1 = line1;
                        blinkieParms.cleantext2 = line2;
                    }
                }
            }
            // else (no spaces), split at middle char.
            else {
                const chars = blinkieParms.cleantext.split('');
                const half = Math.ceil(chars.length / 2);
                blinkieParms.cleantext1 = chars.splice(0, half).join('');
                blinkieParms.cleantext2 = chars.splice(-half).join('');
            }
        }
    }
    catch (err) {
        blinkieParms.errmsg = err.msg;
        blinkieParms.errloc = 'processText()';
    }

    return blinkieParms;
}

async function renderFrames(blinkieID, blinkieParms) {
    let stdout = [];
    let stderr = [];
    try {
        if (typeof(blinkieParms.x) != 'object') {
            const staticx = blinkieParms.x;
            blinkieParms.x = [];
            for (let i=0; i<blinkieParms.frames; i++) {
                blinkieParms.x.push(staticx)
            }
        }
        if (typeof(blinkieParms.shadowx) != 'object') {
            const staticshadowx = blinkieParms.shadowx;
            blinkieParms.shadowx = [];
            for (let i=0; i<blinkieParms.frames; i++) {
                blinkieParms.shadowx.push(staticshadowx)
            }
        }
        let argsArray = [];
        for (let i=0; i<blinkieParms.frames; i++) {
            argsArray[i] = [
                blinkieParms.antialias,
                '-gravity','Center',
                '-family',blinkieParms.font,
                '-pointsize',blinkieParms.fontsize,
                '-weight',blinkieParms.fontweight
            ]
            if (blinkieParms.outline) {
                argsArray[i].push(
                    '-page', '+'+(blinkieParms.x[i]+1)+'+'+(blinkieParms.y),
                    '-fill', blinkieParms.outline[i],
                    "-annotate", "+0+0", blinkieParms.cleantext1,
                    '-page', '+'+(blinkieParms.x[i]-1)+'+'+(blinkieParms.y),
                    '-fill', blinkieParms.outline[i],
                    "-annotate", "+0+0", blinkieParms.cleantext1,
                    '-page', '+'+(blinkieParms.x[i])+'+'+(blinkieParms.y+1),
                    '-fill', blinkieParms.outline[i],
                    "-annotate", "+0+0", blinkieParms.cleantext1,
                    '-page', '+'+(blinkieParms.x[i])+'+'+(blinkieParms.y-1),
                    '-fill', blinkieParms.outline[i],
                    "-annotate", "+0+0", blinkieParms.cleantext1,
                );
                if (blinkieParms.split) {
                    argsArray[i].push(
                        '-page', '+'+(blinkieParms.x[i]+1)+'+'+(blinkieParms.y2),
                        '-fill', blinkieParms.outline[i],
                        "-annotate", "+0+0", blinkieParms.cleantext2,
                        '-page', '+'+(blinkieParms.x[i]-1)+'+'+(blinkieParms.y2),
                        '-fill', blinkieParms.outline[i],
                        "-annotate", "+0+0", blinkieParms.cleantext2,
                        '-page', '+'+(blinkieParms.x[i])+'+'+(blinkieParms.y2+1),
                        '-fill', blinkieParms.outline[i],
                        "-annotate", "+0+0", blinkieParms.cleantext2,
                        '-page', '+'+(blinkieParms.x[i])+'+'+(blinkieParms.y2-1),
                        '-fill', blinkieParms.outline[i],
                        "-annotate", "+0+0", blinkieParms.cleantext2,
                    );
                }
                argsArray
            }
            if (blinkieParms.shadow) {
                argsArray[i].push(
                    '-page', '+'+(blinkieParms.x[i]+blinkieParms.shadowx[i])
                    +'+'+(blinkieParms.y+blinkieParms.shadowy),
                    '-fill', blinkieParms.shadow[i],
                    "-annotate", "+0+0", blinkieParms.cleantext1
                );
            }
            if (blinkieParms.split) {
                argsArray[i].push(
                    '-page', '+'+(blinkieParms.x[i])+'+'+blinkieParms.y2,
                    '-fill', blinkieParms.colour[i],
                    "-annotate", "+0+0", blinkieParms.cleantext2);
            }
            if (blinkieParms.undercolor) {
                argsArray[i].push("-undercolor",blinkieParms.undercolor);
            }
            argsArray[i].push(
                '-page', '+'+blinkieParms.x[i]+'+'+blinkieParms.y,
                '-fill', blinkieParms.colour[i],
                "-annotate", "+0+0", blinkieParms.cleantext1,
                global.appRoot + '/assets/blinkies-bg/png/' + blinkieParms.bgID
                + '-' + i + '.png',
                global.appRoot + '/assets/blinkies-frames/' + blinkieID
                + '-' + i + '.png'
            );
            stdout[i] = execFile('convert', argsArray[i]);
        }
    }
    catch (err) {
        blinkieParms.errmsg = err.message;
        blinkieParms.errloc = 'renderFrames()';
    }

    await Promise.all(stdout);
    return blinkieParms;
}

async function renderBlinkie(blinkieID, blinkieParms) {
    let args_gif = [
        '-page','+0+0',
        '-delay',blinkieParms.delay,
        '-loop','0',
        '-scale',blinkieParms.scale,
        global.appRoot + '/assets/blinkies-frames/' + blinkieID + '*',
        global.appRoot + '/public/blinkies-public/blinkiesCafe-' + blinkieID + '.gif'
    ]
    const { stdout_gif, stderr_gif } = await execFile('convert', args_gif);
    if (stderr_gif) {
        blinkieParms.errmsg = stderr_gif;
        blinkieParms.errloc = 'renderBlinkie()';
    }
    return blinkieParms;
}

async function pour(instyle, intext, inscale, split) {
    let blinkieLink = ''

    try {
        // assign blinkie parms
        const scaleVals = {1: '100%', 2: '200%', 4:'400%'};
        let styleID = String(instyle) in blinkieData.styleProps
            ? String(instyle) : '0020-blinkiesCafe';
        let blinkieParms = {
            'styleID':    styleID,
            'bgID':       blinkieData.styleProps[styleID].bgID
                ? blinkieData.styleProps[styleID].bgID : styleID,
            'intext':     intext,
            'cleantext':  '',
            'cleantext1': '',
            'cleantext2': '',
            'scale':      scaleVals[inscale] ? scaleVals[inscale] : '100%',
            'antialias':  blinkieData.styleProps[styleID].antialias
                ? blinkieData.styleProps[styleID].antialias : '+antialias',
            'delay':      blinkieData.styleProps[styleID].delay
                ? blinkieData.styleProps[styleID].delay : 10,
            'fontweight': blinkieData.styleProps[styleID].fontweight
                ? blinkieData.styleProps[styleID].fontweight : 'normal',
            'frames':     blinkieData.styleProps[styleID].frames,
            'colour':     blinkieData.styleProps[styleID].colour,
            'shadow':     blinkieData.styleProps[styleID].shadow,
            'shadowx':    blinkieData.styleProps[styleID].shadowx
                ? blinkieData.styleProps[styleID].shadowx : -1,
            'shadowy':    blinkieData.styleProps[styleID].shadowy
                ? blinkieData.styleProps[styleID].shadowy : 0,
            'outline':    blinkieData.styleProps[styleID].outline,
            'undercolor': blinkieData.styleProps[styleID].undercolor,
            'font':       blinkieData.styleProps[styleID].font,
            'fontsize':   blinkieData.styleProps[styleID].fontsize,
            'x':          blinkieData.styleProps[styleID].x,
            'y':          blinkieData.styleProps[styleID].y,
            'x2':         blinkieData.styleProps[styleID].x,
            'y2':         0,
            'unicodeCharCodes': '',
            'split':      split
        };

        // generate unique blinkie ID & URL.
        const blinkieID = makeid(2);
        blinkieLink = siteURL + '/b/blinkiesCafe-' + blinkieID + '.gif';

        // sanitize input text, use default text if empty.
        blinkieParms.cleantext = sanitizeText(blinkieParms.intext);
        if (blinkieParms.cleantext.replace(/\s/g, '').length == 0) {
            blinkieParms.cleantext = sanitizeText(blinkieData.styleProps[blinkieParms.styleID].name);
        }

        // prepare text for rendering, then render frames and generate gif.
        blinkieParms = await processText(blinkieParms);
        if (!blinkieParms.errloc) blinkieParms = await renderFrames(blinkieID, blinkieParms);
        if (!blinkieParms.errloc) blinkieParms = await renderBlinkie(blinkieID, blinkieParms, blinkieLink);

        // delete frames.
        let frameFname = '';
        for (let i=0; i<blinkieParms.frames; i++) {
            frameFname = global.appRoot + '/assets/blinkies-frames/'
                + blinkieID + '-' + i + '.png';
            fs.unlink(frameFname, function(err) {
                if (err) logger.error({
                    time: Date.now(),
                    mtype: 'pour',
                    details: {
                        errloc: 'framedel',
                        errmsg: err.message}
                    });
            });
        }

        if (blinkieParms.errloc) {
            blinkieLink = siteURL + '/b/display/blinkiesCafe-error.gif';
            logger.error({
                time:  Date.now(),
                mtype: 'pour',
                details: {
                    errloc: blinkieParms.errloc,
                    errmsg: blinkieParms.errmsg
                }
            });
        }

    }  // end try
    catch (err) {
        blinkieLink = siteURL + '/b/display/blinkiesCafe-error.gif';
        logger.error({
            time:  Date.now(),
            mtype: 'pour',
            details: {
                errmsg: err.message,
                errloc: "pour()"
            }
        });
    }

    return blinkieLink;
}

module.exports = {
    pour
}
