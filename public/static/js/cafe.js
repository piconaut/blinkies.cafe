/*jslint browser */

/*----------*/
/* declares */
/*----------*/
let blinkieTiles    = document.querySelectorAll(".blinkieTile");
const pageSize      = blinkieTiles.length;
const urlRoot       = '';
let currentSort     = 'bdaydesc';
let firstPour       = true;
let global = {
    'delay':2010
};


/*---------------------*/
/* GET & POST requests */
/*---------------------*/

function getStyleList() {
    return fetch('/styleList.json').then((response)=>response.json())
                                   .then((responseJson)=>{return responseJson});
}
function postBlinkie(blinkieText, blinkieStyle, blinkieScale, splitText, toFeed) {
    return fetch(urlRoot + "/api/pour", {
        body: JSON.stringify({blinkieText: blinkieText, blinkieStyle: blinkieStyle, blinkieScale: blinkieScale, splitText: splitText, toFeed: toFeed}),
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
function loadStyles (styleList, styleOrder, currentPage, firstLoad) {
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
            blinkieTiles[i].onclick  = function() { selectStyle(styleList, styleID); }
            blinkieTiles[i].style.visibility = '';
            if (!firstLoad) {
                blinkieTiles[i].src      = '/b/display/' + styleID + '.gif';
                blinkieTiles[i].alt      = styleList[styleID].name + ' blinkie';
            }
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
    // preview style if first pour in session.
    let freshBlinkie = document.getElementById('freshBlinkie');
    if (firstPour) freshBlinkie.src = urlRoot + '/b/display/' + targetKey + '.gif';

    let blinkieText = document.getElementById('blinkieText');
    const tips = ['your text here!',
                  'type /heart for \u2665',
                  'type /eheart for \u2661',
                  'type /spade for \u2660',
                  'type /dia for \u2666',
                  'type /club for \u2663',
                  'make smth cool :D',
                  'trans rights!!'];
    blinkieText.placeholder = tips[Math.floor(Math.random()*tips.length)];

    // show selected style first in dropdown.
    let blinkieStyle = document.getElementById('blinkieStyle');
    for(let i = 0; i < blinkieStyle.options.length; i++) {
        if(blinkieStyle.options[i].value == targetKey) {
            blinkieStyle.selectedIndex = i;
            break;
        }
    }

    let gallery = document.getElementById('gallery');
    let pour = document.getElementById('pour');
    gallery.style.visibility = 'hidden';
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

function sortStyles(styleList, sortval, direction) {
    currentSort = sortval + direction;
    let styleArray = []
    for (var style in styleList){
        styleArray.push([style,styleList[style][sortval]])
    }
    let styleOrder = styleArray.sort(function(a, b) {
        if (direction == 'desc') return b[1] - a[1];
        else if (direction == 'asc') return a[1] - b[1];
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

let lastRequestTime = 0;
function submit (event) {
    event.preventDefault();
    firstPour = false;

    // if last submitted request was more than cooldown ago, submit parms from form,
    // then after receiving reply, display the newly generated blinkie.
    if (lastRequestTime < Date.now() - global.delay) {
        lastRequestTime = Date.now();
        let anakinLink = document.getElementById("anakinLink");
        let freshBlinkie = document.getElementById("freshBlinkie");
        let blinkieText = document.getElementById("blinkieText").value;
        let splitText = document.getElementById("toggleSplit").checked;
        let blinkieStyle = document.getElementById("blinkieStyle").value;
        let blinkieScale = document.getElementById("blinkieScale").value;
        let toFeed = !document.getElementById("hideFeed").checked;
        let blinkieLinkHolder = document.getElementById('blinkieLinkHolder');
        let submitbtn = document.getElementById('submitbtn');

        submitbtn.innerText = 'brewing...';
        setTimeout(function() { submitbtn.innerText = 'generate!!'; }, global.delay);

        postBlinkie(blinkieText, blinkieStyle, blinkieScale, splitText, toFeed).then( function(blinkieURL) {
            freshBlinkie.src = blinkieURL;
            blinkieLinkHolder.innerHTML = '';
            let blinkieLink = document.createElement('a');
            blinkieLink.innerHTML = 'download blinkie';
            blinkieLink.href = blinkieURL;
            blinkieLink.download = blinkieURL.split('/')[4];
            blinkieLink.target = "_blank";
            blinkieLinkHolder.appendChild(blinkieLink);
            blinkieLinkHolder.innerHTML += "<br>blinkies kept for 1 hour only!<br>upload to <a href='https://imgur.com/upload' target='_blank'>imgur</a> to use on spacehey.";
            if (global.styleList[blinkieStyle].subName == 'Anakin') anakinLink.style.visibility = ''; else anakinLink.style.visibility = 'hidden';
            if (submitbtn.innerText == 'brewing...') submitbtn.innerText = 'cooldown..'
        });
    }
}

/*---------------------*/
/* initial load        */
/*---------------------*/
getStyleList().then(function(styleList){
    global.styleList = {}
    Object.assign(global.styleList,styleList)
    let currentPage      = 1;
    const nextPage       = document.getElementById("nextPage");
    const prevPage       = document.getElementById("prevPage");
    const sortNew        = document.getElementById("sortNew");
    const sortOld        = document.getElementById("sortOld");
    const sortRandom     = document.getElementById("sortRandom");
    const selectTags     = document.getElementById("selectTags");

    let styleOrder = sortStyles(styleList,'bday','desc');
    loadStyles(styleList, styleOrder, 1, true);
    selectTags.onchange = function() {
        const tag = selectTags.value;
        Object.assign(styleList, global.styleList);

        switch(tag) {
            case 'all':
                break;
            case 'idk':
                for (let style in styleList){
                    if (styleList[style].tags) {
                        delete styleList[style];
                    }
                }
                break;
            default:
                for (let style in styleList){
                    if (!styleList[style].tags || !(styleList[style].tags.includes(tag))) {
                        delete styleList[style];
                    }
                }
        }


        styleOrder = sortStyles(styleList,'bday', 'desc');
        loadStyles(styleList, styleOrder, 1, false);
        currentPage = 1;
    }
    sortNew.onclick = function() {
        if (currentSort != 'bdaydesc') {
            styleOrder = sortStyles(styleList,'bday', 'desc');
            loadStyles(styleList, styleOrder, 1, false);
            currentPage = 1;
        }
    }
    sortOld.onclick = function() {
        if (currentSort != 'bdayasc') {
            styleOrder = sortStyles(styleList,'bday', 'asc');
            loadStyles(styleList, styleOrder, 1, false);
            currentPage = 1;
        }
    }
    sortRandom.onclick = function() {
        styleOrder = shuffleStyles(styleList);
        loadStyles(styleList, styleOrder, 1, false);
        currentPage = 1;
    }
    nextPage.onclick = function() {
        currentPage ++;
        loadStyles(styleList, styleOrder, currentPage, false);
    }
    prevPage.onclick = function() {
        currentPage --;
        loadStyles(styleList, styleOrder, currentPage, false);
    }
});

document.getElementById("blinkieForm").addEventListener("submit", submit);
document.getElementById("blinkieText").addEventListener("keypress", enterSubmit);
document.getElementById("blinkieStyle").addEventListener("keypress", enterSubmit);
document.getElementById("blinkieScale").addEventListener("keypress", enterSubmit);

document.getElementById("backToGalleryBtn").onclick = function() {
    let gallery = document.getElementById("gallery");
    let pour = document.getElementById("pour");
    gallery.style.visibility = '';
    pour.style.visibility = 'hidden';
}

document.getElementById("badgetxt").onclick = function() {
    this.focus();
    this.select();
}
