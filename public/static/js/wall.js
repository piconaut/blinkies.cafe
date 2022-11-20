const blinkies = document.querySelectorAll("#tiles a");
const search = document.getElementById("search");

function unspecify(string) {
    return string.toLowerCase().replaceAll(" ", "");
}

function searchBlinkies() {
    const prompt = unspecify(search.value);
    for (let i = 0; i < blinkies.length; i++) {
        const blinkie = blinkies[i];
        if (unspecify(blinkie.id).indexOf(prompt) > -1) blinkie.style.display = "";
        else blinkie.style.display = "none";
    }
}

document.getElementById("backToGalleryBtn").onclick = function() {
    history.back();
}

search.addEventListener("input", searchBlinkies);
search.addEventListener("keyup", searchBlinkies);
searchBlinkies();
