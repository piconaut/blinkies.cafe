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
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random()*charactersLength));
    }
    return result;
}

function sanitizeText(str) {
    return (str.substring(0,64) + '').replace(/[\\']/g, '\\$&').replace(/\u0000/g, '\\0').replace(/[♡❤]/g,'\u2665').replace(/❤️/g,'\u2665').replace(/💜/g,'\u2665');
}

async function processText(blinkieParms) {
    try {
        // get all unicode char codes from string.
        blinkieParms.unicodeCharCodes = '';
        for (var i = 0; i < blinkieParms.cleantext.length; i++) {
            blinkieParms.unicodeCharCodes += blinkieParms.cleantext.charCodeAt(i).toString(16) + ' ';
        }

        // if text has chars not in style font, try fallback fonts in order.
        let fontSearch   = "fc-list '" + blinkieParms.font + ":charset=" + blinkieParms.unicodeCharCodes + "'";
        let foundFont    = await exec(fontSearch);
        if (foundFont.stdout.length == 0) {
            let i = 0;
            let fontFound = false;
            while (!fontFound && i<Object.keys(blinkieData.fallbackFonts).length) {
                fontSearch = "fc-list '" + blinkieData.fallbackFonts[i].family + ":charset=" + blinkieParms.unicodeCharCodes + "'";
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
        if (!blinkieParms.split && blinkieParms.cleantext.length > 28) {
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
        let argsArray = [];
        for (let i=0; i<blinkieParms.frames; i++) {
            argsArray[i] = [
                blinkieParms.antialias,
                '-gravity','Center',
                '-family',blinkieParms.font,
                '-pointsize',blinkieParms.fontsize,
                '-weight',blinkieParms.fontweight
            ]
            if (blinkieParms.shadow) {
                argsArray[i].push('-page', '+'+(blinkieParms.x-1)+'+'+blinkieParms.y, '-fill', blinkieParms.shadow[i],
                                  '-draw', "text 0,0 '" + blinkieParms.cleantext1 + "'");
            }
            if (blinkieParms.split) {
                argsArray[i].push('-page', '+'+(blinkieParms.x2)+'+'+blinkieParms.y2, '-fill', blinkieParms.colour[i],
                                  '-draw', "text 0,0 '" + blinkieParms.cleantext2 + "'");
            }
            argsArray[i].push(
                '-page', '+'+blinkieParms.x+'+'+blinkieParms.y, '-fill', blinkieParms.colour[i],
                '-draw', "text 0,0 '" + blinkieParms.cleantext1 + "'",
                global.appRoot + '/assets/blinkies-bg/png/' + blinkieParms.bgID + '-' + i + '.png',
                global.appRoot + '/assets/blinkies-frames/' + blinkieID + '-' + i + '.png'
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
        let styleID = String(instyle) in blinkieData.styleProps ? String(instyle) : '0020-blinkiesCafe';
        let blinkieParms = {
            'styleID':    styleID,
            'bgID':       blinkieData.styleProps[styleID].bgID ? blinkieData.styleProps[styleID].bgID : styleID,
            'intext':     intext,
            'cleantext':  '',
            'cleantext1': '',
            'cleantext2': '',
            'scale':      scaleVals[inscale] ? scaleVals[inscale] : '100%',
            'antialias':  '+antialias',
            'delay':      blinkieData.styleProps[styleID].delay ? blinkieData.styleProps[styleID].delay : 10,
            'fontweight': blinkieData.styleProps[styleID].fontweight ? blinkieData.styleProps[styleID].fontweight : 'normal',
            'frames':     blinkieData.styleProps[styleID].frames,
            'colour':     blinkieData.styleProps[styleID].colour,
            'shadow':     blinkieData.styleProps[styleID].shadow,
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
            frameFname = global.appRoot + '/assets/blinkies-frames/' + blinkieID + '-' + i + '.png';
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
