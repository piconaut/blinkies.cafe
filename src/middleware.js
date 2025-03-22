function noSpecials(str) {
    return str.replace(/[^a-zA-Z0-9-. ]/g, '');
}

function blockHotlinking(req, res, next) {
    const referer = req.get('Referer');
    if (referer && !referer.startsWith(`${req.protocol}://${req.get('Host')}`)) {
        // Serve a placeholder image for hotlinked requests
        res.sendFile(`${global.appRoot}/public/blinkies-public/display/no-hotlinking.gif`);
    } else {
        next();
    }
}

module.exports = {
    noSpecials,
    blockHotlinking
}
