/* eslint no-control-regex: "off", no-unused-vars: ["error", { "varsIgnorePattern": "stdout*" }] */
const fs = require("fs");
const util = require('util');
const blinkieData = require('./blinkieData.js')
const execFile = util.promisify(require('child_process').execFile);

const siteURL = global.prod ? 'https://blinkies.cafe' : 'http://localhost:8080';

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
    return (str.substring(0,64) + '').replace(/[^a-zA-Z0-9-_'!.?<>(){} ]/g, '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

async function pour(instyle, intext, inscale) {
    let blinkieLink = ''

    try {
        const styleID = String(instyle);
        if (styleID in blinkieData.styleProps) {
            // assign blinkie parms.
            const frames    = blinkieData.styleProps[styleID].frames;
            const colour    = blinkieData.styleProps[styleID].colour;
            const shadow    = blinkieData.styleProps[styleID].shadow;
            const font      = blinkieData.styleProps[styleID].font;
            const fontsize  = blinkieData.styleProps[styleID].fontsize;
            const x         = blinkieData.styleProps[styleID].x;
            const y         = blinkieData.styleProps[styleID].y;
            const scaleVals = {1: '100%', 2: '200%', 4:'400%'};
            const scale     = scaleVals[inscale] ? scaleVals[inscale] : '100%';

            // sanitize input text, use default text if empty.
            let cleantext = sanitizeText(intext);
            if (cleantext.replace(/\s/g, '').length == 0) {
                cleantext = sanitizeText(blinkieData.styleProps[styleID].name);
            }

            // generate unique blinkie ID & URL.
            const blinkieID = makeid(2);
            blinkieLink = siteURL + '/b/blinkiesCafe-' + blinkieID + '.gif';

            // generate frames with text.
            let stdout = [];
            let argsArray = [];
            for (let i=0; i<frames; i++) {
                argsArray[i] = [
                    '-pointsize',fontsize,
                    '+antialias',
                    '-gravity','Center',
                    '-family',font,
                ]
                if (shadow) {
                    argsArray[i].push('-page')
                    argsArray[i].push('+'+(x-1)+'+'+y,)
                    argsArray[i].push('-fill');
                    argsArray[i].push(shadow[i]);
                    argsArray[i].push('-draw',"text 0,0 '" + cleantext + "'")
                }
                argsArray[i].push('-page')
                argsArray[i].push('+'+x+'+'+y,)
                argsArray[i].push('-fill');
                argsArray[i].push(colour[i]);
                argsArray[i].push('-draw',"text 0,0 '" + cleantext + "'")
                argsArray[i].push(global.appRoot + '/assets/blinkies-bg/png/' + styleID + '-' + i + '.png');
                argsArray[i].push(global.appRoot + '/assets/blinkies-frames/' + blinkieID + '-' + i + '.png')
                stdout[i] = execFile('convert', argsArray[i]);
            }

            // await frame generation, then await gif generation from frames.
            let args_gif = [
                '-page','+0+0',
                '-delay','10',
                '-loop','0',
                '-scale',scale,
                global.appRoot + '/assets/blinkies-frames/' + blinkieID + '*',
                global.appRoot + '/public/blinkies-public/blinkiesCafe-' + blinkieID + '.gif'
            ]
            await Promise.all(stdout);
            const { stdout_gif, stderr_gif } = await execFile('convert', args_gif);

            if (stderr_gif) { return }

            // delete frames.
            for (let i=0; i<frames; i++) {
                fs.unlink(global.appRoot + '/assets/blinkies-frames/' + blinkieID + '-' + i + '.png', function(err) {
                    if (err) { return }
                });
            }

        }  // end if (styleID in styleProps)

        else {
            blinkieLink = siteURL + '/b/display/blinkiesCafe.gif';
        }

    }  // end try

    catch (err) {
        blinkieLink = siteURL + '/b/display/blinkiesCafe.gif';
    }

    return blinkieLink;
}

module.exports = {
    pour
}
