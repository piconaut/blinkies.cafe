async function getSourceData() {
    return fetch('/sourceData.json')
        .then((response)=>response.json())
        .then((responseJson)=>{return responseJson});
}
async function getFontData() {
    return fetch('/fontData.json')
        .then((response)=>response.json())
        .then((responseJson)=>{return responseJson});
}

let sourceList = document.getElementById('sourceList');
getSourceData().then(function(sourceData){
    for (const [key, value] of Object.entries(sourceData)) {
        var sourceItem = document.createElement('p');
        var blank = 22 - value.name.length;
        var sourceLine = value.name + '&nbsp;'.repeat(blank)
        if (value.sourceURL) {
            var sourceLink = document.createElement('a');
            sourceLink.innerHTML = value.sourceName;
            sourceLink.href = value.sourceURL;
            sourceLink.target = "_blank";
            sourceItem.innerHTML = sourceLine + sourceLink.outerHTML;
        }
        else {
            sourceLine += value.sourceName;
            sourceItem.innerHTML = sourceLine;
        }
        sourceList.appendChild(sourceItem);
    }
});

let fontList = document.getElementById('fontList');
getFontData().then(function(fontData){
    for (const [key, value] of Object.entries(fontData)) {
        var sourceItem = document.createElement('p');
        var blank = 22 - value.name.length;
        var sourceLine = value.name + '&nbsp;'.repeat(blank);
        var sourceLink = document.createElement('a');
        sourceLink.innerHTML = value.creator;
        sourceLink.href = value.link;
        sourceLink.target = "_blank";
        sourceItem.innerHTML = sourceLine + sourceLink.outerHTML;

        fontList.appendChild(sourceItem);
    }
});
