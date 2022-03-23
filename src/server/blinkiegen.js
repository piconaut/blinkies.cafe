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
    return (str.substring(0,64) + '').replace(/[\\']/g, '\\$&').replace(/\u0000/g, '\\0').replace(/[♡]/g,'\u2665').replace('❤️','\u2665').replace('💜','\u2665');
}

async function pour(instyle, intext, inscale) {
    let blinkieLink = ''

    try {
        const styleID = String(instyle);
        if (styleID in blinkieData.styleProps) {
            // assign blinkie parms.
            let antialias   = '+antialias';
            let delay       = blinkieData.styleProps[styleID].delay ? blinkieData.styleProps[styleID].delay : 10;
            let fontweight  = blinkieData.styleProps[styleID].fontweight ? blinkieData.styleProps[styleID].fontweight : 'normal';
            const frames    = blinkieData.styleProps[styleID].frames;
            const colour    = blinkieData.styleProps[styleID].colour;
            let shadow      = blinkieData.styleProps[styleID].shadow;
            let font        = blinkieData.styleProps[styleID].font;
            let fontsize    = blinkieData.styleProps[styleID].fontsize;
            let x           = blinkieData.styleProps[styleID].x;
            let y           = blinkieData.styleProps[styleID].y;
            let x2          = x;
            let y2          = 0;
            const scaleVals = {1: '100%', 2: '200%', 4:'400%'};
            const scale     = scaleVals[inscale] ? scaleVals[inscale] : '100%';

            // generate unique blinkie ID & URL.
            const blinkieID = makeid(2);
            blinkieLink = siteURL + '/b/blinkiesCafe-' + blinkieID + '.gif';

            // sanitize input text, use default text if empty.
            let cleantext = sanitizeText(intext);
            if (cleantext.replace(/\s/g, '').length == 0) {
                cleantext = sanitizeText(blinkieData.styleProps[styleID].name);
            }

            // get all unicode char codes from string.
            let unicodeCharCodes = '';
            for (var i = 0; i < cleantext.length; i++) {
                unicodeCharCodes += cleantext.charCodeAt(i).toString(16) + ' ';
            }

            // if any char code is not in style font, try monogramextended,
            // fall back to Liberation Mono.
            let fontSearch   = "fc-list '" + font + ":charset=" + unicodeCharCodes + "'";
            let foundFont    = await exec(fontSearch);
            if (foundFont.stdout.length == 0) {
                fontSearch = "fc-list 'monogramextended:charset=" + unicodeCharCodes + "'";
                foundFont  = await exec(fontSearch);
                if (foundFont.stdout.length > 0) {
                    font     = 'monogramextended';
                    fontsize = 16;
                    y        = 1;
                }
                else {
                    fontSearch = "fc-list 'lanapixel:charset=" + unicodeCharCodes + "'";
                    foundFont  = await exec(fontSearch);
                    if (foundFont.stdout.length > 0) {
                        font     = 'lanapixel';
                        fontsize = 11;
                        y        = -1;
                    }
                    else {
                        antialias = '-antialias';
                        font      = 'Liberation Mono';
                        fontsize  = 10;
                        y         = 0;
                    }
                }
            }

            // if long input text has chars in 04b03, split into two lines.
            const double = (cleantext.length > 26) ? true : false;
            let cleantext1 = cleantext;
            let cleantext2 = '';
            if (double) {
                fontSearch = "fc-list '04b03:charset=" + unicodeCharCodes + "'";
                foundFont  = await exec(fontSearch);
                if (foundFont.stdout.length > 0) {
                    antialias = '+antialias';
                    font = '04b03';
                    fontsize = 8;
                    shadow = undefined;
                    y = 4;
                    y2 = -4;

                    const words = cleantext.split(' ');
                    let diff = 99;
                    let line1 = '';
                    let line2 = '';
                    for (let i=0; i<words.length; i++) {
                        line1 = words.slice(0,i+1).join(' ');
                        line2 = words.slice(i+1,words.length+1).join(' ');
                        if ( Math.abs(line1.length - line2.length) < diff ) {
                            diff = Math.abs(line1.length - line2.length);
                            cleantext1 = line1;
                            cleantext2 = line2;
                        }
                    }
                }
            }

            // generate frames with text.
            let stdout = [];
            let argsArray = [];
            for (let i=0; i<frames; i++) {
                argsArray[i] = [
                    antialias,
                    '-gravity','Center',
                    '-family',font,
                    '-pointsize',fontsize,
                    '-weight',fontweight
                ]
                if (shadow) {
                    argsArray[i].push('-page', '+'+(x-1)+'+'+y, '-fill', shadow[i],
                                      '-draw', "text 0,0 '" + cleantext1 + "'");
                }
                if (double) {
                    argsArray[i].push('-page', '+'+(x2-1)+'+'+y2, '-fill', colour[i],
                                      '-draw', "text 0,0 '" + cleantext2 + "'");
                }
                argsArray[i].push(
                    '-page', '+'+x+'+'+y, '-fill', colour[i],
                    '-draw', "text 0,0 '" + cleantext1 + "'",
                    global.appRoot + '/assets/blinkies-bg/png/' + styleID + '-' + i + '.png',
                    global.appRoot + '/assets/blinkies-frames/' + blinkieID + '-' + i + '.png'
                );
                stdout[i] = execFile('convert', argsArray[i]);
            }

            // await frame generation, then await gif generation from frames.
            let args_gif = [
                '-page','+0+0',
                '-delay',delay,
                '-loop','0',
                '-scale',scale,
                global.appRoot + '/assets/blinkies-frames/' + blinkieID + '*',
                global.appRoot + '/public/blinkies-public/blinkiesCafe-' + blinkieID + '.gif'
            ]
            await Promise.all(stdout);
            const { stdout_gif, stderr_gif } = await execFile('convert', args_gif);

            if (stderr_gif) {
                blinkieLink = siteURL + '/b/display/blinkiesCafe.gif';
                logger.error({
                    time:  Date.now(),
                    mtype: 'pour',
                    details: stderr_gif
                });
            }

            // delete frames.
            let frameFname = '';
            for (let i=0; i<frames; i++) {
                frameFname = global.appRoot + '/assets/blinkies-frames/' + blinkieID + '-' + i + '.png';
                fs.unlink(frameFname, function(err) {
                    if (err) {
                        logger.error({
                            time:  Date.now(),
                            mtype: 'pour',
                            details: err
                        });
                    }
                });
            }

        }  // end if (styleID in styleProps)

        else {
            blinkieLink = siteURL + '/b/display/0020-blinkiesCafe.gif';
        }

    }  // end try

    catch (err) {
        blinkieLink = siteURL + '/b/display/blinkiesCafe-error.gif';
        logger.error({
            time:  Date.now(),
            mtype: 'pour',
            details: err
        });
    }

    return blinkieLink;
}

module.exports = {
    pour
}
