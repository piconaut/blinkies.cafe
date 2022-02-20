/*jslint browser */

/*---------------------*/
/* GET & POST requests */
/*---------------------*/
function getStyleList() {
    return fetch('/styleList.json').then((response)=>response.json())
                                   .then((responseJson)=>{return responseJson});
}
function postBlinkie(blinkieText, blinkieStyle, blinkieScale) {
    return fetch(urlRoot + "/api/pour", {
        body: JSON.stringify({blinkieText: blinkieText, blinkieStyle: blinkieStyle, blinkieScale: blinkieScale}),
        headers: {"Content-Type": "application/json"},
        method: "POST"
    })
        .then((res) => res.text())
        .then(blinkieURL => { return blinkieURL; })
}

/*------------------*/
/* gallery browsing */
/*------------------*/

// populate gallery page.
function loadStyles (styleList, styleOrder, currentPage) {
    // calculate index of first & last blinkies on page.
    const indexStart = pageSize*(currentPage-1);
    const indexEnd   = indexStart + pageSize;
    const nextPage       = document.getElementById("nextPage");
    const pageNum        = document.getElementById("currPage")
    const prevPage       = document.getElementById("prevPage");

    // make array of all styles from first to last on page.
    let stylePage = [];
    for (let i=indexStart; i<indexEnd; i++) {
        if (styleOrder[i]) {
            stylePage.push(styleOrder[i]);
        }
    }

    // update each blinkie tile based on page array.
    for (let i=0; i<pageSize; i++) {
        // if page has enough blinkies to populate tile, update the tile.
        if (i < stylePage.length) {
            const styleID            = stylePage[i][0];
            blinkieTiles[i].src      = '/b/display/' + styleID + '.gif';
            blinkieTiles[i].alt      = styleList[styleID].name + ' blinkie';
            blinkieTiles[i].onclick = function() { selectStyle(styleList, styleID); }
            blinkieTiles[i].style.visibility = '';
        }
        // if page has insufficient blinkies to populate tile, hide the tile.
        else {
            blinkieTiles[i].style.visibility = 'hidden';
        }
    }

    // update page number & buttons.
    pageNum.innerText         = currentPage;
    prevPage.style.visibility = currentPage < 2 ? 'hidden' : '';
    nextPage.style.visibility = indexEnd >= styleOrder.length ? 'hidden' : '';
}

// select a blinkie to customize.
function selectStyle(styleList, targetKey) {
    let freshBlinkie = document.getElementById('freshBlinkie');
    let gallery = document.getElementById('gallery');
    let pour = document.getElementById('pour');
    let firstopt = document.getElementById('firstopt');

    firstopt.value = targetKey;
    firstopt.innerHTML = styleList[targetKey].name;
    freshBlinkie.src = urlRoot + '/b/display/' + targetKey + '.gif';

    gallery.style['z-index'] = 0;
    gallery.style.visibility = 'hidden';
    pour.style['z-index'] = 1;
    pour.style.visibility = '';

}

function shuffleStyles(styleList) {
    currentSort = 'random';
    let styleArray = []
    for (var style in styleList){
        styleArray.push([style])
    }

    let styleOrder = styleArray.map(value => ({ value, sort: Math.random() }))
                               .sort((a, b) => a.sort - b.sort)
                               .map(({ value }) => value);

    return(styleOrder);
}

function sortStyles(styleList, sortval) {
    currentSort = sortval;
    let styleArray = []
    for (var style in styleList){
        styleArray.push([style,styleList[style][sortval]])
    }
    let styleOrder = styleArray.sort(function(a, b) {
        return b[1] - a[1];
    });

    return styleOrder
}

/*-------------------*/
/* submit user input */
/*-------------------*/
function enterSubmit(event){
    if(event.key === 'Enter'){
        event.target.form.dispatchEvent(new Event("submit", {cancelable: true}));
        event.preventDefault();
    }
}

function submit (event) {
    event.preventDefault();
    let freshBlinkie = document.getElementById("freshBlinkie");
    let blinkieText = document.getElementById("blinkieText").value;
    let blinkieStyle = document.getElementById("blinkieStyle").value;
    let blinkieScale = document.getElementById("blinkieScale").value;
    let blinkieLinkHolder = document.getElementById('blinkieLinkHolder');
    let submitbtn = document.getElementById('submitbtn');

    submitbtn.innerText = 'generating';

    postBlinkie(blinkieText, blinkieStyle, blinkieScale).then( function(blinkieURL) {
        freshBlinkie.src = blinkieURL;
        blinkieLinkHolder.innerHTML = '';
        let blinkieLink = document.createElement('a');
        blinkieLink.innerHTML = 'download blinkie';
        blinkieLink.href = blinkieURL;
        blinkieLink.download = blinkieURL.split('/')[4];
        blinkieLink.target = "_blank";
        blinkieLinkHolder.appendChild(blinkieLink);
        blinkieLinkHolder.innerHTML += '&nbsp;or<br>desktop: drag &#38; drop<br>mobile:&nbsp;&nbsp;tap &amp; hold &gt; "copy image"';
        submitbtn.innerText = 'generate!!';
    });
}

/*---------------------*/
/* initial load        */
/*---------------------*/
let blinkieTiles     = document.querySelectorAll(".blinkieTile");
const pageSize       = blinkieTiles.length;
const urlRoot        = '';
let currentSort      = 'bday';

getStyleList().then(function(styleList){
    let currentPage      = 1;
    const nextPage       = document.getElementById("nextPage");
    const prevPage       = document.getElementById("prevPage");
    const sortNew        = document.getElementById("sortNew");
    const sortRandom     = document.getElementById("sortRandom");

    let styleOrder = sortStyles(styleList,'bday');
    loadStyles(styleList, styleOrder, 1);
    sortNew.onclick = function() {
        if (currentSort != 'bday') {
            styleOrder = sortStyles(styleList,'bday');
            loadStyles(styleList, styleOrder, 1);
            currentPage = 1;
        }
    }
    sortRandom.onclick = function() {
        styleOrder = shuffleStyles(styleList);
        loadStyles(styleList, styleOrder, 1);
        currentPage = 1;
    }
    nextPage.onclick = function() {
        currentPage ++;
        loadStyles(styleList, styleOrder, currentPage);
    }
    prevPage.onclick = function() {
        currentPage --;
        loadStyles(styleList, styleOrder, currentPage);
    }
});

document.getElementById("blinkieForm").addEventListener("submit", submit);
document.getElementById("blinkieText").addEventListener("keypress", enterSubmit);
document.getElementById("blinkieStyle").addEventListener("keypress", enterSubmit);
document.getElementById("blinkieScale").addEventListener("keypress", enterSubmit);

document.getElementById("backToGalleryBtn").onclick = function() {
    let gallery = document.getElementById("gallery");
    let pour = document.getElementById("pour");
    gallery.style['z-index'] = 1;
    gallery.style.visibility = '';
    pour.style['z-index'] = 0;
    pour.style.visibility = 'hidden';
}
