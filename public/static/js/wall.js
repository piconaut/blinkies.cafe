const blinkies = document.querySelectorAll("#tiles a");
const search = document.getElementById("search");

function unspecify(string) {
    return string.toLowerCase().replaceAll(" ", "");
}

function searchBlinkies() {
    const prompt = unspecify(search.value);
    for (let i = 0; i < blinkies.length; i++) {
        const blinkie = blinkies[i];
        if (unspecify(blinkie.id).indexOf(prompt) > -1) blinkie.style.display = "initial";
        else blinkie.style.display = "none";
    }
}

search.addEventListener("input", searchBlinkies);
search.addEventListener("keyup", searchBlinkies);
searchBlinkies();
