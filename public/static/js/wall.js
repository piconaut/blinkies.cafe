let blinkies = document.querySelectorAll("#tiles a");

function unspecify(string) {
    return string.toLowerCase().replaceAll(" ", "");
}

function searchBlinkies() {
    let prompt = unspecify(search.value);
    console.log(prompt)
    for (let i = 0; i < blinkies.length; i++) {

        let blinkie = blinkies[i];
        if (unspecify(blinkie.id).indexOf(prompt) > -1) {
            blinkie.style.opacity = "1";
            // Depending on what you prefer, you can also use .display to fully hide the other ones!
            //blinkie.style.display = "initial";
        }
        else {
            blinkie.style.opacity = "0.2";
            //blinkie.style.display = "none";
        }
    }
}


search.addEventListener("input", searchBlinkies);
search.addEventListener("keyup", searchBlinkies);
searchBlinkies();