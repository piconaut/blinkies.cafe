function getSourceList() {
    return fetch('/sourceList.json').then((response)=>response.json())
                                   .then((responseJson)=>{return responseJson});
}

/**
 * Populate archive page with blinkies.
 * Updates the styles and content of a paginated archive display based on the provided data source and page number.
 *
 * @param {Array} sourceArray - An array of data representing the archive items. Each item is expected to be an array
 *                              with the following structure:
 *                              [0] {string} - The identifier for the blinkie (used in the image source URL).
 *                              [1] {string} - The name or description of the blinkie.
 *                              [2] {string} - The URL associated with the blinkie.
 *                              [3] {string} - The generation or category of the blinkie.
 * @param {number} page - The current page number to display.
 *
 * @global
 * @property {HTMLElement} nextPage - The DOM element representing the "Next Page" button.
 * @property {HTMLElement} pageNum - The DOM element displaying the current page number.
 * @property {HTMLElement} prevPage - The DOM element representing the "Previous Page" button.
 * @property {NodeList} archiveBlinkies - A collection of DOM elements representing the blinkie images.
 * @property {NodeList} archiveGens - A collection of DOM elements representing the blinkie generations/categories.
 * @property {NodeList} archiveLinks - A collection of DOM elements representing the blinkie links.
 * @property {Array} sourceRows - A global array of DOM elements representing the rows in the archive display.
 *
 * @throws {Error} If `sourceArray` is not an array or `page` is not a number.
 */
function loadStyles (sourceArray, page) {
    // calculate index of first & last blinkies on page.
    const indexStart = pageSize*(page-1);
    const indexEnd   = indexStart + pageSize;
    const nextPage       = document.getElementById("nextPage");
    const pageNum        = document.getElementById("currPage")
    const prevPage       = document.getElementById("prevPage");

    // make array of all styles from first to last on page.
    let sourcePage = [];
    for (let i=indexStart; i<indexEnd; i++) {
        if (sourceArray[i]){
            sourcePage.push(sourceArray[i]);
        }
    }

    let archiveBlinkies = document.querySelectorAll(".archiveBlinkie");
    let archiveGens     = document.querySelectorAll(".archiveGen");
    let archiveLinks    = document.querySelectorAll(".archiveLink");
    for (let i=0; i<pageSize; i++) {
        // if page has enough blinkies to populate tile, update the tile.
        if (i < sourcePage.length) {
            sourceRows[i].style.visibility = '';
            archiveBlinkies[i].src    = "/b/display/archive/" + sourcePage[i][0] + '.gif';
            archiveBlinkies[i].alt    = 'blinkie from ' + sourcePage[i][1];
            archiveLinks[i].innerText = sourcePage[i][1];
            archiveLinks[i].href      = sourcePage[i][2];
            archiveGens[i].innerText  = sourcePage[i][3];
            archiveGens[i].href       = '/?s=' + sourcePage[i][0];
        }
        // if page has insufficient blinkies to populate tile, hide the tile.
        else {
            sourceRows[i].style.visibility = 'hidden';
        }
    }

    // update page number & buttons.
    pageNum.innerText         = page;
    prevPage.style.visibility = page < 2 ? 'hidden' : '';
    nextPage.style.visibility = indexEnd >= sourceArray.length ? 'hidden' : '';
}

let currentPage = 1;
let sourceRows = document.querySelectorAll(".sourceRow");
const pageSize = sourceRows.length;

getSourceList().then(function(sourceList){
    let sourceArray = [];
    for (const [key,value] of Object.entries(sourceList)) {
        sourceArray.push([key, value.sourceName, value.sourceURL, value.name])
    }

    const nextPage       = document.getElementById("nextPage");
    const prevPage       = document.getElementById("prevPage");
    onClickOrEnter(nextPage, function() {
        currentPage ++;
        loadStyles(sourceArray, currentPage);
    });
    onClickOrEnter(prevPage, function() {
        currentPage --;
        loadStyles(sourceArray, currentPage);
    });

});
