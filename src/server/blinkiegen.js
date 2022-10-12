/* eslint no-control-regex: "off", no-unused-vars: ["error", { "args":"none", "varsIgnorePattern": "std*" }] */
const fs       = require("fs");
const util     = require('util');
const execFile = util.promisify(require('child_process').execFile);
const exec     = util.promisify(require('child_process').exec);

const blinkieData = require('./blinkieData.js')
const fontData    = require('./fontData.js')
const logger      = require('./logger.js').logger

const siteURL = global.prod ? 'https://blinkies.cafe' : '';

function replaceChars(str) {
    const trimString = str.substring(0,128) + '';
    const sanitizedString = trimString.replace(/[\\']/g, '\\$&').replace(/\u0000/g, '\\0').replace(/\ufe0f/g, '').replace(/%/g, '\\%');
    const charMap = {
        '/heart':'\u2665',
        '/eheart':'\u2661',
        '/spade':'\u2660',
        '/club':'\u2663',
        '/diamond':'\u2666',
        '/dia':'\u2666',
        '/skull':'\u2620',
        '💀':'\u2620',
        '/cat':'\u260b',
        '🐈':'\u260b',
        '/smile':'\u263a',
        '🙂':'\u263a',
        '/phone':'\u260e',
        '/x':'\u2613',
        '✖':'\u2613',
        '/peace':'\u262e',
        '/crown':'\u265b',
        '👑':'\u265b',
        '/eyes':'\u23ff',
        '👀':'\u23ff',
        '/crab':'\u260a',
        '🦀':'\u260a',
        '/flower':'\u2638',
        '🌼':'\u2638',
        '/neu':'\u2639',
        '😐':'\u2639',
        '/4note':'\u2669',
        '/8note':'\u266a',
        '/16note':'\u266b',
        '/alien':'\u2657',
        '👽':'\u2657',
        '\u2764':'\u2665',
        '\ud83d\udc9a':'\u2665',
        '\ud83d\udc9b':'\u2665',
        '\ud83d\udc9c':'\u2665',
        '\ud83d\udc9d':'\u2665',
        '\ud83d\udc9e':'\u2665',
        '\ud83d\udc9f':'\u2665',
        '\ud83d\udd84':'\u2665',
        '\ud83d\udc99':'\u2665',
        '\ud83e\udde1':'\u2665',
    }
    var re = new RegExp(Object.keys(charMap).join("|"),"gi");
    const outString = sanitizedString.replace(re, function(matched){
        return charMap[matched.toLowerCase()];
    });
    return outString;
}

async function processText(bParms) {
    try {

        // if user selected font, set parms for that font.
        if (fontData.fonts[bParms.fontOverride]) {
            bParms.font = bParms.fontOverride;
            bParms.fontsize = fontData.fonts[bParms.fontOverride].fontsize;
            bParms.y = fontData.fonts[bParms.fontOverride].y;
            bParms.antialias = fontData.fonts[bParms.fontOverride].antialias;
        }

        // else (auto font)
        else {
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
                const fallbackFonts = fontData.fallbackFonts;
                while (!fontFound && i<fallbackFonts.length) {
                    fontSearch = "fc-list '" + fallbackFonts[i]
                               + ":charset=" + bParms.unicodeCharCodes + "'";
                    foundFont  = await exec(fontSearch);
                    if (foundFont.stdout.length > 0 || i==fallbackFonts.length-1) {
                        const selectedFont     = fallbackFonts[i];
                        bParms.font      = fallbackFonts[i];
                        bParms.antialias = fontData.fonts[selectedFont].antialias;
                        bParms.fontsize  = fontData.fonts[selectedFont].fontsize;
                        bParms.y         = fontData.fonts[selectedFont].y;
                        fontFound = true;
                    }
                    i ++;
                }
            } // end fallback fonts.

            // if input text is long & supported by small font, set split flag.
            if (!bParms.split && bParms.cleantext.length > 35) {
                fontSearch = "fc-list '04b03:charset=" + bParms.unicodeCharCodes + "'";
                foundFont  = await exec(fontSearch);
                if (foundFont.stdout.length > 0) bParms.split = true;
            }
        } // end auto fonts.

        bParms.cleantext1 = bParms.cleantext;
        bParms.cleantext2 = '';

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
        } // end split.

    } // end try.

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

    function eachFrame(val, frames) {
        switch(typeof(val)) {
            case 'undefined':
                return undefined;
            case 'object':
                return val;
            default:
                return Array(frames).fill(val);
        }
    }

    try {
        bParms.x       = eachFrame(bParms.x, bParms.frames);
        bParms.shadowx = eachFrame(bParms.shadowx, bParms.frames);
        bParms.colour  = eachFrame(bParms.colour, bParms.frames);
        bParms.outline = eachFrame(bParms.outline, bParms.frames);
        bParms.shadow  = eachFrame(bParms.shadow, bParms.frames);

        let argsArray = [];
        for (let i=0; i<bParms.frames; i++) {
            argsArray[i] = [
                global.appRoot + '/assets/blinkies-bg/png/' + bParms.bgID + '-' + i + '.png',
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
            argsArray[i].push(
                ...buildTextArgs(bParms.cleantext1,bParms.x[i],bParms.y,0,0,bParms.colour[i]),
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
    let args_gif = [];
    let frameDelay = bParms.delay + 1;
    for (let i=0;i<bParms.frames;i++) {
        args_gif.push(
            '-delay',frameDelay,
            '-dispose','background',
            global.appRoot + '/assets/blinkies-frames/' + blinkieID + '-' + i + '.png',
            '-page','+0+0',
        );
        frameDelay = bParms.delay;
    }
    args_gif.push(
        '-loop','0',
        '-scale',bParms.scale,
        global.appRoot + '/public/blinkies-public/blinkiesCafe-' + blinkieID + '.gif');
    const { stdout_gif, stderr_gif } = await execFile('convert', args_gif);
    if (stderr_gif) {
        bParms.errmsg = stderr_gif;
        bParms.errloc = 'renderBlinkie()';
    }
    return bParms;
}

async function pour(blinkieID, instyle, fontOverride, intext, inscale, split) {
    let blinkieLink = ''

    try {
        // assign blinkie parms
        const scaleVals = {1: '100%', 2: '200%', 3: '300%', 4:'400%'};
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
            'fontOverride': fontOverride,
            'x':          blinkieData.styleProps[styleID].x,
            'y':          blinkieData.styleProps[styleID].y,
            'x2':         blinkieData.styleProps[styleID].x,
            'y2':         0,
            'unicodeCharCodes': '',
            'split':      split,
            'splitDefault': blinkieData.styleProps[styleID].splitDefault
                ? blinkieData.styleProps[styleID].splitDefault : false
        };

        blinkieLink = siteURL + '/b/blinkiesCafe-' + blinkieID + '.gif';

        // sanitize input text, use default text if empty.
        bParms.cleantext = replaceChars(bParms.intext);
        if (bParms.cleantext.replace(/\s/g, '').length == 0) {
            bParms.cleantext = replaceChars(blinkieData.styleProps[bParms.styleID].name);
            bParms.split = bParms.splitDefault;
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
