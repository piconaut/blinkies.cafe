/*jslint browser */

function getStyleList() {
    return fetch('/styleList.json')
        .then((response)=>response.json())
        .then((responseJson)=>{return responseJson});
}

function postBlinkie(blinkieText, blinkieStyle) {
    return fetch("/api/blinkiegen", {
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
    let blinkieGIF = document.getElementById("blinkieGIF");
    let blinkieText = document.getElementById("blinkieText").value;
    let blinkieStyle = document.getElementById("blinkieStyle").value;
    let blinkieLinkHolder = document.getElementById('blinkieLinkHolder');

    postBlinkie(blinkieText, blinkieStyle).then( function(blinkieURL) {
        blinkieGIF.src = blinkieURL;
        blinkieLinkHolder.innerHTML = 'blinkie link: <br>';
        let blinkieLink = document.createElement('a');
        blinkieLink.innerHTML = blinkieURL.split('//')[1];
        blinkieLink.href = blinkieURL;
        blinkieLink.target = "_blank";
        blinkieLinkHolder.appendChild(blinkieLink);
    });
};

let styleSelect = document.getElementById('blinkieStyle');
getStyleList().then(function(styleList){
    for (const [key, value] of Object.entries(styleList)) {
        let opt = document.createElement('option');
        opt.value = key;
        opt.innerHTML = value.name;
        styleSelect.appendChild(opt);
    }
});

document.getElementById("blinkieForm").addEventListener("submit", submit);
document.getElementById("blinkieText").addEventListener("keypress", enterSubmit);
document.getElementById("blinkieStyle").addEventListener("keypress", enterSubmit);
