/*jslint browser */

function getStyleList() {
    return fetch('/styleList.json')
        .then((response)=>response.json())
        .then((responseJson)=>{return responseJson});
}

let styleSelect = document.getElementById('blinkieStyle');
let gallery = document.getElementById('gallery');
getStyleList().then(function(styleList){
    for (const [key, value] of Object.entries(styleList)) {
        let link = document.createElement('a');
        link.href = '/pour?s=' + key;

        let img = document.createElement('img');
        img.src = '/b/display/' + value.id + '.gif';
        img.alt = value.name;
        img.classList.add('blinkie');

        link.appendChild(img)
        gallery.appendChild(link);
    }
});
