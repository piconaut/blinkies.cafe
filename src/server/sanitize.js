function noSpecials(str) {
    return str.replace(/[^a-zA-Z0-9-. ]/g, '');
}

module.exports = {
    noSpecials
}
