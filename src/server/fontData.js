const fonts = {
    "moonaco" : {
        fontsize:  16,
        y:         0,
        antialias: '+antialias',
        sourceName:"amy",
        sourceURL: "https://graphics-cafe.tumblr.com",
    },
    "offical emotes." : {
        fontsize:  16,
        y:         0,
        antialias: '+antialias',
        symbols:   true,
        sourceName:"transbro",
        sourceURL: "https://fontstruct.com/fontstructions/show/2151214/emotes-3-1",
    },
    "monogramextended" : {
        fontsize:  16,
        y:         1,
        antialias: '+antialias',
        sourceName:"datagoblin",
        sourceURL: "https://datagoblin.itch.io/monogram"
    },
    "lanapixel" : {
        fontsize:  11,
        y:         -1,
        antialias: '+antialias',
        charsets:  true,
        sourceName:"eishiya",
        sourceURL: "https://opengameart.org/content/lanapixel-localization-friendly-pixel-font"
    },
    "pixeloid sans" : {
        fontsize:  9,
        fontweight:'bold',
        y:         0,
        antialias: '+antialias',
        sourceName:"GGBotNet",
        sourceURL:"https://www.dafont.com/pixeloid-sans.font"
    },
    "04b03" : {
        fontsize:  8,
        y:         0,
        antialias: '+antialias',
        sourceName:"押本祐二",
        sourceURL:"https://www.dafont.com/04b-03.font"
    },
    "rainyhearts" : {
        fontsize:  16,
        y:         0,
        antialias: '+antialias',
        sourceName:"Camellina",
        sourceURL:"https://www.dafont.com/rainyhearts.font"
    },
    "infernalda" : {
        fontsize:  16,
        y:         -1,
        antialias: '+antialias',
        sourceName:"MrtheNoronha",
        sourceURL:"https://www.dafont.com/infernalda.font"
    },
    "pixelpoiiz" : {
        fontsize:  10,
        y:         0,
        antialias: '+antialias',
        sourceName:"poiiz",
        sourceURL:"https://www.dafont.com/pixelpoiiz.font"
    },
    "doublehomicide" : {
        fontsize:  16,
        y:         0,
        antialias: '+antialias',
        sourceName:"jeti",
        sourceURL:"https://fontenddev.com/"
    },
    "hydratinglip" : {
        fontsize:  13,
        y:         0,
        antialias: '+antialias',
        sourceName:"Hazel Abbiati",
        sourceURL:"https://diamondidiocy.tumblr.com/"
    },
    "Perfect DOS VGA 437" : {
        fontsize:  16,
        y:         -1,
        antialias: '+antialias',
        sourceName:"Zeh Fernando",
        sourceURL:"https://www.dafont.com/perfect-dos-vga-437.font"
    },
    "dogica" : {
        fontsize:  12,
        y:         1,
        antialias: '+antialias',
        sourceName:"Roberto Mocci",
        sourceURL: "https://www.dafont.com/dogica.font"
    },
    "alagard" : {
        fontsize:  16,
        y:         -1,
        antialias: '+antialias',
        sourceName:"Hewett Tsoi",
        sourceURL: "https://www.dafont.com/alagard.font"
    },
    "fipps" : {
        fontsize:  8,
        y:         0,
        antialias: '+antialias',
        sourceName:"pheist",
        sourceURL: "https://www.dafont.com/fipps.font"
    },
    "pixel icons compilation" : {
        fontsize:  13,
        y:         0,
        antialias: '+antialias',
        sourceName:"Woodcutter",
        sourceURL: "https://www.dafont.com/pixel-icons-compilation.font"
    },
    "{pixelflag}" : {
        fontsize:  16,
        y:         -1,
        antialias: '+antialias',
        sourceName:"Chequered Ink",
        sourceURL: "https://www.dafont.com/pixelflag.font"
    },
    "grapesoda" : {
        fontsize:  16,
        y:         0,
        antialias: '+antialias',
        sourceName:"jeti",
        sourceURL: "https://www.dafont.com/grapesoda-2.font"
    },
    "green screen" : {
        fontsize:  12,
        y:         0,
        antialias: '+antialias',
        sourceName:"James Shields",
        sourceURL: "https://www.dafont.com/green-screen.font"
    },
    "digitaldisco" : {
        fontsize:  16,
        y:         0,
        antialias: '+antialias',
        sourceName:"jeti",
        sourceURL: "https://fontenddev.com/"
    },
    "04b_19" : {
        fontsize:  14,
        y:         0,
        antialias: '+antialias',
        sourceName:"押本祐二",
        sourceURL: "https://www.dafont.com/04b-19.font"
    },
}

const fontList = {
    2: {name:"Pixellari",  sourceName:"Zacchary Dempsey-Plante", sourceURL:"https://www.dafont.com/pixellari.font"},
    8: {name:"Hack", sourceName:"Source Foundry", sourceURL:"https://sourcefoundry.org/hack/"},
    11: {name:"Liberation Mono", sourceName:"Red Hat", sourceURL:"https://www.fontsquirrel.com/fonts/liberation-sans"},
    18: {name:"Pixeloid", sourceName:"ggbot", sourceURL:"https://ggbot.itch.io/pixeloid-font"},
};

const fallbackFonts = ["moonaco", "offical emotes.", "monogramextended", "lanapixel"];

module.exports = {
    fontList,
    fallbackFonts,
    fonts
}
