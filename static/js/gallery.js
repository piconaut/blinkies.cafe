/*jslint browser */

/*---------------------*/
/* declares            */
/*---------------------*/
let tiles = document.getElementById('tiles');
const sortNew = document.getElementById("sortNew");
const sortRandom = document.getElementById("sortRandom");
const nextPage = document.getElementById("nextPage");
const prevPage = document.getElementById("prevPage");
const pageNum = document.getElementById("currPage")
let styleOrder = [];
let currentPage = 1;
const pageSize = 20;

/*---------------------*/
/* GET & POST requests */
/*---------------------*/
function getStyleList() {
    return fetch('/styleList.json')
        .then((response)=>response.json())
        .then((responseJson)=>{return responseJson});
}

function sortStyles(styleList, sortval) {
    let styleArray = []
    for (var style in styleList){
        styleArray.push([style,styleList[style][sortval]])
    }
    let styleOrder = styleArray.sort(function(a, b) {
        return b[1] - a[1];
    });

    return styleOrder
}

function shuffleStyles(styleList) {
    let styleArray = []
    for (var style in styleList){
        styleArray.push([style])
    }

    let styleOrder = styleArray
                      .map(value => ({ value, sort: Math.random() }))
                      .sort((a, b) => a.sort - b.sort)
                      .map(({ value }) => value)

    return(styleOrder);
}


function loadStyles (styleList, styleOrder, page) {
    const indexStart = pageSize*(page-1);
    const indexEnd   = indexStart + pageSize;
    let stylePage = [];
    for (let i=indexStart; i<indexEnd; i++) {
        if (styleOrder[i]) {
            stylePage.push(styleOrder[i]);
        }
    }

    tiles.innerHTML = '';
    for (let style in stylePage) {
        const styleID = stylePage[style][0]
        let blinkieLink = document.createElement('a');
        blinkieLink.href = '/pour?s=' + styleID;

        let blinkie = document.createElement('img');
        blinkie.src = '/b/display/' + styleID + '.gif';
        blinkie.className = 'blinkie';

        blinkieLink.appendChild(blinkie);
        tiles.appendChild(blinkieLink);
    }

    updatePageNumber();
}

function updatePageNumber() {
    const indexStart = pageSize*(currentPage-1);
    const indexEnd   = indexStart + pageSize;
    pageNum.innerText = currentPage;
    prevPage.style.visibility = currentPage < 2 ? 'hidden' : 'visible';
    nextPage.style.visibility = indexEnd > styleOrder.length ? 'hidden' : 'visible';
}

getStyleList().then(function(styleList){
    styleOrder = sortStyles(styleList,'bday');
    updatePageNumber();
    sortNew.onclick = function() {
        styleOrder = sortStyles(styleList,'bday');
        loadStyles(styleList, styleOrder, 1);
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
