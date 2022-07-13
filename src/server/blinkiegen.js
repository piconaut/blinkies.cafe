/* eslint no-control-regex: "off", no-unused-vars: ["error", { "args":"none", "varsIgnorePattern": "std*" }] */
const fs       = require("fs");
const util     = require('util');
const execFile = util.promisify(require('child_process').execFile);
const exec     = util.promisify(require('child_process').exec);

const blinkieData = require('./blinkieData.js')
const logger      = require('./logger.js').logger

const siteURL = global.prod ? 'https://blinkies.cafe' : '';

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

async function processText(bParms) {
    try {
        // get all unicode char codes from string.
        bParms.unicodeCharCodes = '';
        for (var i = 0; i < bParms.cleantext.length; i++) {
            bParms.unicodeCharCodes
            += bParms.cleantext.charCodeAt(i).toString(16) + ' ';
        }

        // if text has chars not in style font, try fallback fonts in order.
        let fontSearch   = "fc-list '" + bParms.font + ":charset="
                         + bParms.unicodeCharCodes + "'";
        let foundFont = await exec(fontSearch);
        if (foundFont.stdout.length == 0) {
            let i = 0;
            let fontFound = false;
            const numFonts = Object.keys(blinkieData.fallbackFonts);
            while (!fontFound && i<numFonts.length) {
                fontSearch = "fc-list '" + blinkieData.fallbackFonts[i].family
                           + ":charset=" + bParms.unicodeCharCodes + "'";
                foundFont  = await exec(fontSearch);
                if (foundFont.stdout.length > 0) {
                    bParms.font      = blinkieData.fallbackFonts[i].family;
                    bParms.antialias = blinkieData.fallbackFonts[i].antialias;
                    bParms.fontsize  = blinkieData.fallbackFonts[i].fontsize;
                    bParms.y         = blinkieData.fallbackFonts[i].y;
                    fontFound = true;
                }
                i ++;
            }
        }

        bParms.cleantext1 = bParms.cleantext;
        bParms.cleantext2 = '';

        // if input text is long & supported by small font, set split flag.
        if (!bParms.split && bParms.cleantext.length > 35) {
            fontSearch = "fc-list '04b03:charset=" + bParms.unicodeCharCodes + "'";
            foundFont  = await exec(fontSearch);
            if (foundFont.stdout.length > 0) bParms.split = true;
        }

        // if split flag is set, split text into two lines.
        if (bParms.split) {
            bParms.antialias = '+antialias';
            bParms.font = '04b03';
            bParms.fontsize = 8;
            bParms.shadow = undefined;
            bParms.y = 4;
            bParms.y2 = -4;

            // if text has spaces, split on space closest to middle.
            if (bParms.cleantext.includes(' ')) {
                const words = bParms.cleantext.split(' ');
                let diff = 99;
                let line1 = '';
                let line2 = '';
                for (let i=0; i<words.length; i++) {
                    line1 = words.slice(0,i+1).join(' ');
                    line2 = words.slice(i+1,words.length+1).join(' ');
                    if ( Math.abs(line1.length - line2.length) < diff ) {
                        diff = Math.abs(line1.length - line2.length);
                        bParms.cleantext1 = line1;
                        bParms.cleantext2 = line2;
                    }
                }
            }
            // else (no spaces), split at middle char.
            else {
                const chars = bParms.cleantext.split('');
                const half = Math.ceil(chars.length / 2);
                bParms.cleantext1 = chars.splice(0, half).join('');
                bParms.cleantext2 = chars.splice(-half).join('');
            }
        }
    }
    catch (err) {
        bParms.errmsg = err.msg;
        bParms.errloc = 'processText()';
    }

    return bParms;
}

async function renderFrames(blinkieID, bParms) {
    let stdout = [];
    let stderr = [];

    function buildTextArgs(text, x, y, xoff, yoff, colour) {
        return(['-page', '+'+(x+xoff)+'+'+(y+yoff),'-fill', colour,"-annotate", "+0+0", text]);
    }

    try {
        if (typeof(bParms.x) != 'object') {
            const staticx = bParms.x;
            bParms.x = [];
            for (let i=0; i<bParms.frames; i++) {
                bParms.x.push(staticx)
            }
        }
        if (typeof(bParms.shadowx) != 'object') {
            const staticshadowx = bParms.shadowx;
            bParms.shadowx = [];
            for (let i=0; i<bParms.frames; i++) {
                bParms.shadowx.push(staticshadowx)
            }
        }
        let argsArray = [];
        for (let i=0; i<bParms.frames; i++) {
            argsArray[i] = [
                bParms.antialias,
                '-gravity','Center',
                '-family',bParms.font,
                '-pointsize',bParms.fontsize,
                '-weight',bParms.fontweight
            ]
            if (bParms.outline) {
                argsArray[i].push(
                    ...buildTextArgs(bParms.cleantext1,bParms.x[i],bParms.y,1,0,bParms.outline[i]),
                    ...buildTextArgs(bParms.cleantext1,bParms.x[i],bParms.y,-1,0,bParms.outline[i]),
                    ...buildTextArgs(bParms.cleantext1,bParms.x[i],bParms.y,0,1,bParms.outline[i]),
                    ...buildTextArgs(bParms.cleantext1,bParms.x[i],bParms.y,0,-1,bParms.outline[i])
                );
                if (bParms.split) {
                    argsArray[i].push(
                        ...buildTextArgs(bParms.cleantext2,bParms.x[i],bParms.y2,1,0,bParms.outline[i]),
                        ...buildTextArgs(bParms.cleantext2,bParms.x[i],bParms.y2,-1,0,bParms.outline[i]),
                        ...buildTextArgs(bParms.cleantext2,bParms.x[i],bParms.y2,0,1,bParms.outline[i]),
                        ...buildTextArgs(bParms.cleantext2,bParms.x[i],bParms.y2,0,-1,bParms.outline[i])
                    );
                }
            }
            if (bParms.shadow) argsArray[i].push(...buildTextArgs(bParms.cleantext1,bParms.x[i],bParms.y,bParms.shadowx[i],bParms.shadowy,bParms.shadow[i]));
            if (bParms.split) argsArray[i].push(...buildTextArgs(bParms.cleantext2,bParms.x[i],bParms.y2,0,0,bParms.colour[i]));
            argsArray[i].push(...buildTextArgs(bParms.cleantext1,bParms.x[i],bParms.y,0,0,bParms.colour[i]));
            argsArray[i].push(
                global.appRoot + '/assets/blinkies-bg/png/' + bParms.bgID + '-' + i + '.png',
                global.appRoot + '/assets/blinkies-frames/' + blinkieID + '-' + i + '.png'
            );
            stdout[i] = execFile('convert', argsArray[i]);
        }
    }
    catch (err) {
        bParms.errmsg = err.message;
        bParms.errloc = 'renderFrames()';
    }

    await Promise.all(stdout);
    return bParms;
}

async function renderBlinkie(blinkieID, bParms) {
    let args_gif = [
        '-page','+0+0',
        '-delay',bParms.delay,
        '-loop','0',
        '-scale',bParms.scale,
        '-dispose','previous',
        global.appRoot + '/assets/blinkies-frames/' + blinkieID + '*',
        global.appRoot + '/public/blinkies-public/blinkiesCafe-' + blinkieID + '.gif'
    ]
    const { stdout_gif, stderr_gif } = await execFile('convert', args_gif);
    if (stderr_gif) {
        bParms.errmsg = stderr_gif;
        bParms.errloc = 'renderBlinkie()';
    }
    return bParms;
}

async function pour(blinkieID, instyle, intext, inscale, split) {
    let blinkieLink = ''

    try {
        // assign blinkie parms
        const scaleVals = {1: '100%', 2: '200%', 4:'400%'};
        let styleID = String(instyle) in blinkieData.styleProps
            ? String(instyle) : '0020-blinkiesCafe';
        let bParms = {
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
            'font':       blinkieData.styleProps[styleID].font,
            'fontsize':   blinkieData.styleProps[styleID].fontsize,
            'x':          blinkieData.styleProps[styleID].x,
            'y':          blinkieData.styleProps[styleID].y,
            'x2':         blinkieData.styleProps[styleID].x,
            'y2':         0,
            'unicodeCharCodes': '',
            'split':      split
        };

        blinkieLink = siteURL + '/b/blinkiesCafe-' + blinkieID + '.gif';

        // sanitize input text, use default text if empty.
        bParms.cleantext = sanitizeText(bParms.intext);
        if (bParms.cleantext.replace(/\s/g, '').length == 0) {
            bParms.cleantext = sanitizeText(blinkieData.styleProps[bParms.styleID].name);
        }

        // prepare text for rendering, then render frames and generate gif.
        bParms = await processText(bParms);
        if (!bParms.errloc) bParms = await renderFrames(blinkieID, bParms);
        if (!bParms.errloc) bParms = await renderBlinkie(blinkieID, bParms, blinkieLink);

        // delete frames.
        let frameFname = '';
        for (let i=0; i<bParms.frames; i++) {
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

        if (bParms.errloc) {
            blinkieLink = siteURL + '/b/display/blinkiesCafe-error.gif';
            logger.error({
                time:  Date.now(),
                mtype: 'pour',
                details: {
                    errloc: bParms.errloc,
                    errmsg: bParms.errmsg
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
