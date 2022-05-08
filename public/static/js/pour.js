/*jslint browser */

function postBlinkie(blinkieText, blinkieStyle, blinkieScale) {
    return fetch("/api/pour", {
        body: JSON.stringify({blinkieText: blinkieText, blinkieStyle: blinkieStyle, blinkieScale: blinkieScale}),
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
let submit = function (event) {
    event.preventDefault();
    if (lastRequestTime < Date.now() - 1000) {
        lastRequestTime = Date.now();
        let blinkie = document.getElementById("freshBlinkie");
        let blinkieText = document.getElementById("blinkieText").value;
        let blinkieStyle = document.getElementById("blinkieStyle").value;
        let blinkieScale = document.getElementById("blinkieScale").value;
        let blinkieLinkHolder = document.getElementById('blinkieLinkHolder');
        let submitbtn = document.getElementById('submitbtn');

        submitbtn.innerText = 'generating';

        postBlinkie(blinkieText, blinkieStyle, blinkieScale).then( function(blinkieURL) {
            blinkie.src = blinkieURL;
            blinkieLinkHolder.innerHTML = '';
            let blinkieLink = document.createElement('a');
            blinkieLink.innerHTML = 'download blinkie';
            blinkieLink.href = blinkieURL;
            blinkieLink.download = blinkieURL.split('/')[4];
            blinkieLink.target = "_blank";
            blinkieLinkHolder.appendChild(blinkieLink);
            blinkieLinkHolder.innerHTML += '&nbsp;or<br>desktop: drag &#38; drop<br>mobile:&nbsp;&nbsp;tap &amp; hold &gt; "share image"';
            submitbtn.innerText = 'generate!!';
        });
    }
};

document.getElementById("blinkieForm").addEventListener("submit", submit);
document.getElementById("blinkieText").addEventListener("keypress", enterSubmit);
document.getElementById("blinkieStyle").addEventListener("keypress", enterSubmit);
document.getElementById("blinkieScale").addEventListener("keypress", enterSubmit);
