/* eslint no-control-regex: "off", no-unused-vars: ["error", { "args":"none", "varsIgnorePattern": "std*" }] */
/**
 * @file blinkiegen.js
 * @description This module provides functionality for generating animated "blinkie" GIFs based on user-defined parameters such as style, font, text, and scale. 
 * It includes methods for processing input text, rendering animation frames, and assembling the final GIF. The module relies on external resources 
 * like font and style data, as well as ImageMagick for image manipulation.
 *
 * Key Features:
 * - Supports custom styles, fonts, and text input for blinkie generation.
 * - Automatically handles font fallback for unsupported characters.
 * - Provides text sanitization and character replacement for special symbols.
 * - Allows splitting long text into two lines for better visual presentation.
 * - Generates animation frames and assembles them into a GIF with configurable delays and scaling.
 *
 * Dependencies:
 * - Node.js modules: `fs`, `util`, `child_process`.
 * - External tools: ImageMagick (`convert` command).
 * - Local modules: `blinkieData`, `fontData`, and `logger`.
 *
 * Exports:
 * - `pour`: Main function to generate a blinkie GIF.
 *
 * Usage:
 * Import the module and call the `pour` function with the required parameters to generate a blinkie GIF.
 *
 * Example:
 * ```javascript
 * const { pour } = require('./blinkiegen');
 * const blinkieID = await pour('uniqueID', 'styleID', 'fontName', 'Hello World!', 2, false);
 * console.log(`Generated blinkie ID: ${blinkieID}`);
 * ```
 *
 * Note:
 * - Ensure that the required font and style data files are available in the specified paths.
 * - ImageMagick must be installed and accessible via the command line.
 */

const fs       = require("fs");
const util     = require('util');
const execFile = util.promisify(require('child_process').execFile);
const exec     = util.promisify(require('child_process').exec);
const blinkieData = require('./data/blinkieData.js')
const fontData    = require('./data/fontData.js')
const logger      = require('./logger.js').logger

/**
 * Generates a blinkie GIF based on the provided parameters.
 *
 * @async
 * @function pour
 * @param {string} blinkieID - Unique identifier for the blinkie.
 * @param {string} instyle - Style ID for the blinkie.
 * @param {string} fontOverride - Font to override the default style font.
 * @param {string} intext - Input text to render on the blinkie.
 * @param {number} inscale - Scale factor for the blinkie (1 to 4).
 * @param {boolean} split - Whether to split the text into two lines.
 * @returns {Promise<string>} The blinkie ID or 'error' if an error occurs.
 */
async function pour(blinkieID, instyle, fontOverride, intext, inscale, split) {
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
            'split':      split
        };

        // sanitize input text, use default text if empty.
        bParms.cleantext = replaceChars(bParms.intext);
        if (bParms.cleantext.replace(/\s/g, '').length == 0) {
            bParms.cleantext = replaceChars(blinkieData.styleProps[bParms.styleID].name);
        }

        // prepare text for rendering, then render frames and generate gif.
        bParms = await processText(bParms);
        if (!bParms.errloc) bParms = await renderFrames(blinkieID, bParms);
        if (!bParms.errloc) bParms = await renderBlinkie(blinkieID, bParms);

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
            blinkieID = 'error';
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
        blinkieID = 'error';
        logger.error({
            time:  Date.now(),
            mtype: 'pour',
            details: {
                errmsg: err.message,
                errloc: "pour()"
            }
        });
    }

    return blinkieID;
}

/**
 * Replaces specific substrings or characters in a given string with their corresponding mapped values.
 * The function sanitizes the input string by escaping certain characters and removing unwanted ones,
 * then replaces matches based on a predefined character map.
 *
 * @param {string} str - The input string to process and replace characters in.
 * @returns {string} - The processed string with characters replaced according to the character map.
 */
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


/**
 * Processes text parameters to determine font settings, handle fallback fonts, 
 * and optionally split the text into two lines if necessary.
 *
 * @async
 * @function processText
 * @param {Object} bParms - The parameters for processing text.
 * @param {string} bParms.cleantext - The cleaned input text to process.
 * @param {string} [bParms.fontOverride] - Optional font override specified by the user.
 * @param {string} bParms.font - The current font being used.
 * @param {number} bParms.fontsize - The font size to be applied.
 * @param {string} [bParms.fontweight] - The font weight to be applied, if specified.
 * @param {number} bParms.y - The vertical position for the text.
 * @param {string} [bParms.antialias] - The antialiasing setting for the font.
 * @param {boolean} [bParms.split] - Flag indicating whether the text should be split into two lines.
 * @param {string} [bParms.cleantext1] - The first line of split text, if applicable.
 * @param {string} [bParms.cleantext2] - The second line of split text, if applicable.
 * @param {string} [bParms.errmsg] - Error message, if an error occurs during processing.
 * @param {string} [bParms.errloc] - Location of the error, if an error occurs during processing.
 * @param {Object} fontData - Global font data containing font properties and fallback fonts.
 * @returns {Promise<Object>} The updated `bParms` object with processed text and font settings.
 * @throws {Error} If an error occurs during text processing.
 */
async function processText(bParms) {
    try {

        // if user selected font, set parms for that font.
        if (fontData.fonts[bParms.fontOverride]) {
            bParms.font = bParms.fontOverride;
            bParms.fontsize = fontData.fonts[bParms.fontOverride].fontsize;
            if (fontData.fonts[bParms.fontOverride].fontweight)
                bParms.fontweight = fontData.fonts[bParms.fontOverride].fontweight;
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

/**
 * Renders frames for a blinkie animation based on the provided parameters.
 *
 * @async
 * @function renderFrames
 * @param {string} blinkieID - The unique identifier for the blinkie animation.
 * @param {Object} bParms - The parameters for rendering the frames.
 * @param {number} bParms.frames - The number of frames to render.
 * @param {Array<number>|number} [bParms.x] - The x-coordinate(s) for text placement.
 * @param {Array<number>|number} [bParms.shadowx] - The x-offset(s) for shadow placement.
 * @param {Array<number>|number} [bParms.shadowy] - The y-offset(s) for shadow placement.
 * @param {Array<string>|string} [bParms.colour] - The color(s) for the text.
 * @param {Array<string>|string} [bParms.outline] - The color(s) for the text outline.
 * @param {Array<string>|string} [bParms.shadow] - The color(s) for the text shadow.
 * @param {string} bParms.cleantext1 - The primary text to render.
 * @param {string} [bParms.cleantext2] - The secondary text to render (if split is enabled).
 * @param {boolean} [bParms.split] - Whether to split the text into two lines.
 * @param {number} [bParms.y] - The y-coordinate for the primary text placement.
 * @param {number} [bParms.y2] - The y-coordinate for the secondary text placement (if split is enabled).
 * @param {string} bParms.bgID - The background ID for the frames.
 * @param {boolean} bParms.antialias - Whether to apply antialiasing to the text.
 * @param {string} bParms.font - The font family to use for the text.
 * @param {number} bParms.fontsize - The font size to use for the text.
 * @param {number} bParms.fontweight - The font weight to use for the text.
 * @param {string} [bParms.errmsg] - Error message in case of failure.
 * @param {string} [bParms.errloc] - Error location in case of failure.
 * @returns {Promise<Object>} A promise that resolves to the updated `bParms` object.
 * @throws {Error} If an error occurs during frame rendering.
 */
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
        bParms.shadowy = eachFrame(bParms.shadowy, bParms.frames);
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
            if (bParms.shadow) argsArray[i].push(...buildTextArgs(bParms.cleantext1,bParms.x[i],bParms.y,bParms.shadowx[i],bParms.shadowy[i],bParms.shadow[i]));
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

/**
 * Asynchronously renders a blinkie GIF using the specified parameters.
 *
 * @async
 * @function
 * @param {string} blinkieID - The unique identifier for the blinkie.
 * @param {Object} bParms - The parameters for rendering the blinkie.
 * @param {number} bParms.delay - The delay between frames in the GIF (in centiseconds).
 * @param {number} bParms.frames - The total number of frames in the blinkie animation.
 * @param {number} bParms.scale - The scaling factor for the output GIF.
 * @param {string} [bParms.errmsg] - An optional field to store error messages, if any.
 * @param {string} [bParms.errloc] - An optional field to store the location of the error, if any.
 * @returns {Promise<Object>} A promise that resolves to the updated `bParms` object, potentially containing error information.
 * @throws {Error} If the `execFile` command fails to execute.
 */
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

module.exports = {
    pour
}
