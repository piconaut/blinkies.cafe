/*jslint browser */
const urlRoot       = '';
let global = {
    'delay':2010
};

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
