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
    'delay':2010,
    'currentPage':1
};


/*---------------------*/
/* GET & POST requests */
/*---------------------*/

function getStyleList() {
    return fetch('/styleList.json').then((response)=>response.json())
                                   .then((responseJson)=>{return responseJson});
}
function postBlinkie(blinkieText, blinkieStyle, blinkieFont, blinkieScale, splitText, toFeed) {
    return fetch(urlRoot + "/api/pour", {
        body: JSON.stringify({blinkieText: blinkieText, blinkieStyle: blinkieStyle, blinkieFont: blinkieFont, blinkieScale: blinkieScale, splitText: splitText, toFeed: toFeed}),
        headers: {"Content-Type": "application/json"},
        method: "POST"
    })
        .then((res) => res.text())
        .then(blinkieURL => { return blinkieURL; })
}

/*------------------*/
/* gallery browsing */
/*------------------*/

/**
 * Populate gallery page with blinkie tiles.
 * Updates the styles displayed on the current page, manages pagination, and handles visibility of blinkie tiles.
 *
 * @param {Object} styleList - An object containing style details, where keys are style IDs and values are style metadata.
 * @param {Array} styleOrder - An array defining the order of style IDs to be displayed.
 * @param {number} currentPage - The current page number being displayed.
 * @param {boolean} firstLoad - A flag indicating whether this is the first time the page is being loaded.
 */
function loadStyles (styleList, styleOrder, currentPage, firstLoad) {
    // calculate index of first & last blinkies on page.
    const indexStart = pageSize*(currentPage-1);
    const indexEnd   = indexStart + pageSize;
    const nextPage       = document.getElementById("nextPage");
    const pageNum        = document.getElementById("currPage")
    const prevPage       = document.getElementById("prevPage");
    let url = new URL(document.location.href)
    const blinkieExt = url.searchParams.get('freeze') ? 'png' : 'gif';

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
                blinkieTiles[i].src      = '/b/display/' + styleID + '.' + blinkieExt;
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

/**
 * Updates the credit link and sub badge based on the provided blinkie style.
 *
 * @param {string} blinkieStyle - The key representing the style of the blinkie in the global style list.
 *
 * Global Dependencies:
 * - `global.styleList`: An object containing style information for blinkies. Each style should have:
 *   - `subName` (optional): The name to display in the credit link.
 *   - `subURL` (optional): The URL to link to in the credit link.
 *   - `tags` (array): A list of tags associated with the style.
 *
 * DOM Dependencies:
 * - An element with the ID `creditLink`:
 *   - Displays the credit name and links to the appropriate URL.
 * - An element with the ID `subBadge`:
 *   - Displays a badge if the style has specific tags (e.g., 'anakin').
 *
 * Behavior:
 * - If the style has a `subName`, it updates the `creditLink` element's text and optionally its `href`.
 * - If the style does not have a `subName`, it defaults the `creditLink` to a predefined URL and name.
 * - If the style's tags include 'anakin', it updates the `subBadge` element with a specific badge.
 * - If the style's tags do not include 'anakin', it clears the `subBadge` element.
 */
function updateCredit(blinkieStyle) {
    let creditLink = document.getElementById("creditLink");
    if (global.styleList[blinkieStyle].subName) {
        creditLink.innerHTML = global.styleList[blinkieStyle].subName;
        if (global.styleList[blinkieStyle].subURL) creditLink.href = global.styleList[blinkieStyle].subURL;
        else creditLink.removeAttribute("href");
    }
    else {
        creditLink.href = 'https://graphics-cafe.tumblr.com';
        creditLink.innerHTML = 'amy';
    }

    let subBadge = document.getElementById("subBadge");
    if (global.styleList[blinkieStyle].tags.includes('anakin')) {
        subBadge.href = 'https://transbro.neocities.org';
        subBadge.innerHTML = "<img src='/b/display/anakin.gif' alt='Blinkie Made by Anakin' style='width:150px;height:22px;'>";
    }
    else {
        subBadge.href = '';
        subBadge.innerHTML = '';
    }
}

/**
 * Selects a blinkie style for customization.
 * Updates the UI and URL based on the selected style for a "blinkie" customization.
 *
 * @param {Array<string>} styleList - An array of available style keys (not used in the function).
 * @param {string} targetKey - The key of the selected style to apply.
 *
 * This function performs the following:
 * - If it's the first pour in the session, updates the preview image and credits.
 * - Sets a random placeholder text in the blinkie text input field.
 * - Updates the hidden input field with the selected style key.
 * - Hides the gallery and makes the pour section visible.
 * - Updates the browser's URL to include the selected style key as a query parameter.
 */
function selectStyle(styleList, targetKey) {
    // preview style if first pour in session.
    let freshBlinkie = document.getElementById('freshBlinkie');
    if (firstPour) {
        freshBlinkie.src = urlRoot + '/b/display/' + targetKey + '.gif';
        updateCredit(targetKey);
    }

    let blinkieText = document.getElementById('blinkieText');
    const tips = ['your text here!',
                  'make smth cool :D',
                  'trans rights!!'];
    blinkieText.placeholder = tips[Math.floor(Math.random()*tips.length)];

    // set selected style.
    let selectedStyle = document.getElementById('selectedStyle');
    selectedStyle.value = targetKey;

    let gallery = document.getElementById('gallery');
    let pour = document.getElementById('pour');
    gallery.style.visibility = 'hidden';
    pour.style.visibility = '';

    let url = new URL(document.location.href)
    url.searchParams.set('s', targetKey);
    window.history.pushState('',document.title,url);
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
function enterSubmit(event) {
    if(event.key === 'Enter'){
        event.target.form.dispatchEvent(new Event("submit", {cancelable: true}));
        event.preventDefault();
    }
}

/**
 * Handles the submission of the blinkie generation form.
 * Prevents default form submission behavior, checks cooldown timing, 
 * and sends a request to generate a new blinkie with the provided parameters.
 * Updates the UI with the generated blinkie and relevant download link.
 *
 * @param {Event} event - The event object associated with the form submission.
 */
let lastRequestTime = 0;
function submit(event) {
    event.preventDefault();
    firstPour = false;

    // if last submitted request was more than cooldown ago, submit parms from form,
    // then after receiving reply, display the newly generated blinkie.
    if (lastRequestTime < Date.now() - global.delay) {
        lastRequestTime = Date.now();
        let freshBlinkie = document.getElementById("freshBlinkie");
        let blinkieText = document.getElementById("blinkieText").value;
        let splitText = document.getElementById("toggleSplit").checked;
        let blinkieStyle = document.getElementById("blinkieStyle").value;
        let blinkieFont = document.getElementById("blinkieFont").value;
        let blinkieScale = parseInt(document.getElementById("blinkieScale").value);
        let toFeed = !document.getElementById("hideFeed").checked;
        let blinkieLinkHolder = document.getElementById('blinkieLinkHolder');
        let submitbtn = document.getElementById('submitbtn');

        submitbtn.innerText = 'brewing...';
        setTimeout(function() { submitbtn.innerText = 'generate!!'; }, global.delay);

        postBlinkie(blinkieText, blinkieStyle, blinkieFont, blinkieScale, splitText, toFeed).then( function(blinkieURL) {
            freshBlinkie.src = blinkieURL;
            blinkieLinkHolder.innerHTML = '';
            let blinkieLink = document.createElement('a');
            blinkieLink.innerHTML = 'download blinkie';
            blinkieLink.href = blinkieURL;
            blinkieLink.download = blinkieURL.split('/').at(-1);
            blinkieLink.target = "_blank";
            blinkieLinkHolder.appendChild(blinkieLink);
            blinkieLinkHolder.innerHTML += "<br><b>do not <a href='https://www.keycdn.com/support/what-is-hotlinking' target='_blank'>hotlink</a> or copy/paste image url!</b><br><b>upload your blinkie to an image host</b> to use on your site.";
            updateCredit(blinkieStyle);
            if (submitbtn.innerText == 'brewing...') submitbtn.innerText = 'cooldown..'
        });
    }
}

/*---------------------*/
/* initial load        */
/*---------------------*/

function filterTag(tag) {
    const styleList = {};
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
    return styleList
}

getStyleList().then(function(styleList){
    global.styleList = {}
    Object.assign(global.styleList,styleList)
    const nextPage       = document.getElementById("nextPage");
    const prevPage       = document.getElementById("prevPage");
    const sortNew        = document.getElementById("sortNew");
    const sortOld        = document.getElementById("sortOld");
    const sortRandom     = document.getElementById("sortRandom");
    const selectTags     = document.getElementById("selectTags");

    let toggleFreeze = document.getElementById("toggleFreeze");
    toggleFreeze.onclick = function () {
        let url = new URL(document.location.href)
        if (toggleFreeze.checked) url.searchParams.set('freeze',1);
        else url.searchParams.delete('freeze')
        window.history.pushState('',document.title,url);
        loadStyles(styleList, styleOrder, global.currentPage, false);
    }

    let tags = []
    document.querySelectorAll(".tag").forEach(tag => tags.push(tag.value));

    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    let reqTag = urlParams.get('t');
    if (tags.includes(reqTag)) selectTags.selectedIndex = tags.indexOf(reqTag);

    styleList = filterTag(selectTags.value);
    let styleOrder = sortStyles(styleList,'bday', 'desc');
    loadStyles(styleList, styleOrder, global.currentPage, false);

    selectTags.onchange = function() {
        styleList = filterTag(selectTags.value);
        styleOrder = sortStyles(styleList,'bday', 'desc');
        global.currentPage = 1;
        loadStyles(styleList, styleOrder, global.currentPage, false);
    }
    sortNew.onclick = function() {
        if (currentSort != 'bdaydesc') {
            styleOrder = sortStyles(styleList,'bday', 'desc');
            global.currentPage = 1;
            loadStyles(styleList, styleOrder, global.currentPage, false);
        }
    }
    sortOld.onclick = function() {
        if (currentSort != 'bdayasc') {
            styleOrder = sortStyles(styleList,'bday', 'asc');
            global.currentPage = 1;
            loadStyles(styleList, styleOrder, global.currentPage, false);
        }
    }
    sortRandom.onclick = function() {
        styleOrder = shuffleStyles(styleList);
        global.currentPage = 1;
        loadStyles(styleList, styleOrder, global.currentPage, false);
    }
    nextPage.onclick = function() {
        global.currentPage ++;
        loadStyles(styleList, styleOrder, global.currentPage, false);
    }
    prevPage.onclick = function() {
        global.currentPage --;
        loadStyles(styleList, styleOrder, global.currentPage, false);
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

    let url = new URL(document.location.href)
    url.searchParams.delete('s');
    window.history.pushState('',document.title,url);
}

const symbolToggle = document.getElementById("symbolToggle");
const symbolTable = document.getElementById("symbolTable");
symbolToggle.onclick = function() {
    if (symbolTable.style.visibility == 'hidden') {
        symbolTable.style.visibility = '';
        symbolToggle.innerText = 'hide symbols ▴';
    }
    else {
        symbolTable.style.visibility = 'hidden';
        symbolToggle.innerText = 'show symbols ▾';
    }
}

let symbolButtons = document.querySelectorAll(".symbolButton");
symbolButtons.forEach(function(button){
    button.onclick = function() {
        insertAtCaret('blinkieText',button.innerText);
    }
});

// https://web.archive.org/web/20110102112946/http://http://www.scottklarr.com/topic/425/how-to-insert-text-into-a-textarea-where-the-cursor-is/
function insertAtCaret(areaId,text) {
    var txtarea = document.getElementById(areaId);
    var scrollPos = txtarea.scrollTop;
    var strPos = 0;
    var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ?
        "ff" : (document.selection ? "ie" : false ) );
    var range;
    if (br == "ie") {
        txtarea.focus();
        range = document.selection.createRange();
        range.moveStart ('character', -txtarea.value.length);
        strPos = range.text.length;
    }
    else if (br == "ff") strPos = txtarea.selectionStart;

    var front = (txtarea.value).substring(0,strPos);
    var back = (txtarea.value).substring(strPos,txtarea.value.length);
    txtarea.value=front+text+back;
    strPos = strPos + text.length;
    if (br == "ie") {
        txtarea.focus();
        range = document.selection.createRange();
        range.moveStart ('character', -txtarea.value.length);
        range.moveStart ('character', strPos);
        range.moveEnd ('character', 0);
        range.select();
    }
    else if (br == "ff") {
        txtarea.selectionStart = strPos;
        txtarea.selectionEnd = strPos;
        txtarea.focus();
    }
    txtarea.scrollTop = scrollPos;
}

function queryWall (queryString) {
    const url = new URL(document.location.href);
    const freeze = url.searchParams.get('freeze');
    let queryURL = "/wall?q=" + queryString;
    if (freeze) queryURL += "&freeze=1"
    window.location.href = queryURL;
}
const queryText   = document.getElementById("queryText");
const queryAction = document.getElementById("queryAction");
queryAction.onclick = function () { queryWall(queryText.value); }
queryText.addEventListener("keypress", function (event) {
    if(event.key === 'Enter') queryWall(queryText.value);
});

document.getElementById("badgetxt").onclick = function() {
    this.focus();
    this.select();
}
