function onClickOrEnter(element, func) {
    element.onclick = func;
    element.onkeyup = function(e) {
        if (e.key == "Enter") {
            func(e);
        }
    }
}