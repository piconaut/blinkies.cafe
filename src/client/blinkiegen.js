/*jslint browser */

async function getBlinkieList() {
    return fetch('/blinkieList.json')
        .then((response)=>response.json())
        .then((responseJson)=>{return responseJson});
}

function enterSubmit(event){
    if(event.key === 'Enter'){
        event.target.form.dispatchEvent(new Event("submit", {cancelable: true}));
        event.preventDefault();
    }
}

let submit = async function (event) {
    event.preventDefault();
    let blinkieGIF = document.getElementById("blinkieGIF");
    let blinkieTextVal = document.getElementById("blinkieText").value;
    let blinkieStyleVal = document.getElementById("blinkieStyle").value;
    let blinkieLinkHolder = document.getElementById('blinkieLinkHolder');

    let res = await fetch("/api/blinkiegen", {
        body: JSON.stringify({blinkieText: blinkieTextVal, blinkieStyle: blinkieStyleVal}),
        headers: {"Content-Type": "application/json"},
        method: "POST"
    });
    let blinkieURL = await res.text()

    blinkieGIF.src = blinkieURL;
    blinkieLinkHolder.innerHTML = 'blinkie link: <br>';
    let blinkieLink = document.createElement('a');
    blinkieLink.innerHTML = blinkieURL.split('//')[1];
    blinkieLink.href = blinkieURL;
    blinkieLink.target = "_blank";
    blinkieLinkHolder.appendChild(blinkieLink);
};

let styleSelect = document.getElementById('blinkieStyle');
const blinkieList = await getBlinkieList();

for (const [key, value] of Object.entries(blinkieList)) {
    let opt = document.createElement('option');
    opt.value = key;
    opt.innerHTML = value.name;
    styleSelect.appendChild(opt);
}

document.getElementById("blinkieForm").addEventListener("submit", submit);
document.getElementById("blinkieText").addEventListener("keypress", enterSubmit);
document.getElementById("blinkieStyle").addEventListener("keypress", enterSubmit);
