/*jslint browser */
const urlRoot       = '';
let global = {
    'delay':2010
};

/**
 * Sends a POST request to create a new blinkie with the specified parameters.
 *
 * @param {string} blinkieText - The text content of the blinkie.
 * @param {string} blinkieStyle - The style of the blinkie (e.g., color, animation).
 * @param {string} blinkieFont - The font used for the blinkie text.
 * @param {number} blinkieScale - The scale factor for the blinkie size.
 * @param {boolean} splitText - Whether the text should be split into multiple parts.
 * @param {boolean} toFeed - Whether the blinkie should be added to the feed.
 * @returns {Promise<string>} A promise that resolves to the URL of the created blinkie.
 */
function postBlinkie(blinkieText, blinkieStyle, blinkieFont, blinkieScale, splitText, toFeed) {
    return fetch(urlRoot + "/api/pour", {
        body: JSON.stringify({blinkieText: blinkieText, blinkieStyle: blinkieStyle, blinkieFont: blinkieFont, blinkieScale: blinkieScale, splitText: splitText, toFeed: toFeed}),
        headers: {"Content-Type": "application/json"},
        method: "POST"
    })
        .then((res) => res.text())
        .then(blinkieURL => { return blinkieURL; })
}

function enterSubmit(event){
    if(event.key === 'Enter'){
        event.target.form.dispatchEvent(new Event("submit", {cancelable: true}));
        event.preventDefault();
    }
}

/**
 * Handles the submission of a form to generate a blinkie.
 * Prevents multiple submissions within a specified cooldown period.
 * 
 * @param {Event} event - The event object triggered by the form submission.
 * 
 * @description
 * This function checks if the cooldown period has elapsed since the last request.
 * If allowed, it gathers form input values, updates the UI to indicate processing,
 * and sends the data to the `postBlinkie` function. Upon receiving the generated
 * blinkie URL, it updates the image source and provides a download link.
 * 
 * @global {Object} global - A global object containing configuration values.
 * @global {number} global.delay - The cooldown period in milliseconds.
 * @global {number} lastRequestTime - A timestamp of the last request.
 * 
 * @requires postBlinkie - A function that sends the blinkie data to the server
 * and returns a Promise resolving to the generated blinkie URL.
 */
let lastRequestTime = 0;
function submit (event) {
    event.preventDefault();

    // if last submitted request was more than cooldown ago, submit parms from form,
    // then after receiving reply, display the newly generated blinkie.
    if (lastRequestTime < Date.now() - global.delay) {
        lastRequestTime = Date.now();
        let freshBlinkie = document.getElementById("freshBlinkie");
        let blinkieText = document.getElementById("blinkieText").value;
        let blinkieStyle = document.getElementById("blinkieStyle").value;
        let blinkieFont = document.getElementById("blinkieFont").value;
        let blinkieScale = document.getElementById("blinkieScale").value;
        let blinkieLinkHolder = document.getElementById('blinkieLinkHolder');
        let submitbtn = document.getElementById('submitbtn');

        submitbtn.innerText = 'brewing...';
        setTimeout(function() { submitbtn.innerText = 'generate!!'; }, global.delay);

        postBlinkie(blinkieText, blinkieStyle, blinkieFont, blinkieScale).then( function(blinkieURL) {
            freshBlinkie.src = blinkieURL;
            blinkieLinkHolder.innerHTML = '';
            let blinkieLink = document.createElement('a');
            blinkieLink.innerHTML = 'download blinkie';
            blinkieLink.href = blinkieURL;
            blinkieLink.download = blinkieURL.split('/').at(-1);
            blinkieLink.target = "_blank";
            blinkieLinkHolder.appendChild(blinkieLink);
            blinkieLinkHolder.innerHTML += "<br>blinkies kept for 1 hour only!";
            if (submitbtn.innerText == 'brewing...') submitbtn.innerText = 'cooldown..'
        });
    }
}

document.getElementById("blinkieForm").addEventListener("submit", submit);
document.getElementById("blinkieText").addEventListener("keypress", enterSubmit);
document.getElementById("blinkieStyle").addEventListener("keypress", enterSubmit);
document.getElementById("blinkieScale").addEventListener("keypress", enterSubmit);
document.getElementById("blinkieFont").addEventListener("keypress", enterSubmit);
