/*jslint browser */

// declares
let blinkieTiles     = document.querySelectorAll(".blinkieTile");
let blinkieLinkTiles = document.querySelectorAll(".blinkieLinkTile");
const pageSize       = blinkieLinkTiles.length;
const nextPage       = document.getElementById("nextPage");
const prevPage       = document.getElementById("prevPage");
const pageNum        = document.getElementById("currPage")
const sortNew        = document.getElementById("sortNew");
const sortRandom     = document.getElementById("sortRandom");
let currentPage      = 1;
let currentSort      = 'bday';
let styleOrder       = [];

function getStyleList() {
    return fetch('/styleList.json').then((response)=>response.json())
                                   .then((responseJson)=>{return responseJson});
}

function loadStyles (styleList, styleOrder, page) {
    // calculate index of first & last blinkies on page.
    const indexStart = pageSize*(page-1);
    const indexEnd   = indexStart + pageSize;

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
            blinkieLinkTiles[i].href = '/pour?s=' + styleID;
            blinkieTiles[i].src      = '/b/display/' + styleID + '.gif';
            blinkieTiles[i].alt      = styleList[styleID].name + ' blinkie';
            blinkieLinkTiles[i].style.display = 'inline';
        }
        // if page has insufficient blinkies to populate tile, hide the tile.
        else {
            blinkieLinkTiles[i].style.display = 'none';
        }
    }

    updatePageNumber();
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

function updatePageNumber() {
    const indexStart          = pageSize*(currentPage-1);
    const indexEnd            = indexStart + pageSize;
    pageNum.innerText         = currentPage;
    prevPage.style.visibility = currentPage < 2 ? 'hidden' : 'visible';
    nextPage.style.visibility = indexEnd >= styleOrder.length ? 'hidden' : 'visible';
}

getStyleList().then(function(styleList){
    styleOrder = sortStyles(styleList,'bday');
    updatePageNumber();
    sortNew.onclick = function() {
        if (currentSort != 'bday') {
            styleOrder = sortStyles(styleList,'bday');
            loadStyles(styleList, styleOrder, 1);
        }
    }
    sortRandom.onclick = function() {
        styleOrder = shuffleStyles(styleList);
        loadStyles(styleList, styleOrder, 1);
    }
    nextPage.onclick = function() {
        currentPage ++;
        loadStyles(styleList, styleOrder, currentPage);
    }
    prevPage.onclick = function() {
        currentPage --;
        loadStyles(styleList, styleOrder, currentPage);
    }
})
