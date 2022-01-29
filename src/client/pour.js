/*jslint browser */

function postBlinkie(blinkieText, blinkieStyle) {
    return fetch("/api/pour", {
        body: JSON.stringify({blinkieText: blinkieText, blinkieStyle: blinkieStyle}),
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

let submit = function (event) {
    event.preventDefault();
    let blinkie = document.getElementById("freshBlinkie");
    let blinkieText = document.getElementById("blinkieText").value;
    let blinkieStyle = document.getElementById("blinkieStyle").value;
    let blinkieLinkHolder = document.getElementById('blinkieLinkHolder');

    postBlinkie(blinkieText, blinkieStyle).then( function(blinkieURL) {
        blinkie.src = blinkieURL;
        blinkieLinkHolder.innerHTML = '';
        let blinkieLink = document.createElement('a');
        blinkieLink.innerHTML = 'download blinkie';
        blinkieLink.href = blinkieURL;
        blinkieLink.download = blinkieURL.split('/')[4];
        blinkieLink.target = "_blank";
        blinkieLinkHolder.appendChild(blinkieLink);
        blinkieLinkHolder.innerHTML += '<br>or drag &#38; drop';
    });
};

document.getElementById("blinkieForm").addEventListener("submit", submit);
document.getElementById("blinkieText").addEventListener("keypress", enterSubmit);
document.getElementById("blinkieStyle").addEventListener("keypress", enterSubmit);
