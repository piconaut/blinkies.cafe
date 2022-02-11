const styleProps = {
    '0015-exit-button':   {name:"too many tabs!!", bday:20220211, frames:2, colour:["#ffffff","#ffffff"], font: "monaco", fontsize:16, x:12, y:0, sourceName:"me :)"},
    '0014-pride':         {name:"kinda gay tbh...", bday:20220206, frames:4, colour:["#ffffff","#ffffff","#ffffff", "#ffffff"], shadow:["#666666","#666666","#666666", "#666666"], font: "monaco", fontsize:16, x:0, y:0, sourceName:"me :)"},
    '0013-starryeyes':    {name:"Starry Eyes!", bday:20220201, frames:3, colour:["#002984","#002984","#002984"], font: "rainyhearts", fontsize:16, x:-4, y:0, sourceName:"Crazifleebs05", sourceURL:"https://web.archive.org/web/20091027021040/http://geocities.com/crazifleebs05/"},
    '0012-kiss':          {name:"good kisser", bday:20220124, frames:2, colour:["#feaaaa","#feaaaa"], font: "monaco", fontsize:16, x:0, y:0, sourceName:"y2k.neocities.org", sourceURL:"https://y2k.neocities.org"},
    '0011-frog':          {name:"frog friend", bday:20220124, frames:2, colour:["#000000","#000000"], font: "monaco", fontsize:16, x:0, y:0, sourceName:"me :)"},
    '0007-chocolate':     {name:"chocolate dreams", bday:20220120, frames:2, colour:["#000000","#000000"], font: "monaco", fontsize:16, x:0, y:0, sourceName:"toloveanangel0", sourceURL:"https://web.archive.org/web/20091027005417/http://www.geocities.com/toloveanangel0/graphics/blinkies/"},
    '0002-mushroom':      {name:"mushroom boy", bday:20220118, frames:2, colour:["#8c2000","#8c2000"], font: "monaco", fontsize:16, x:0, y:0, sourceName:"me :)"},
    '0003-ghost':         {name:"Spooky vibes only!!", bday:20211215, frames:2, colour:["#e79400","#e77400"], font: "infernalda", fontsize:16, x:-13, y:-1, sourceName:"y2k.neocities.org", sourceURL:"https://y2k.neocities.org"},
    '0004-peachy':        {name:"just peachy", bday:20211214, frames:2, colour:["black","black"], font:"monaco", fontsize:16, x:7, y:0, sourceName:"y2k.neocities.org", sourceURL:"https://y2k.neocities.org"},
    '0005-citystars':     {name:"city stars", bday:20211214, frames:2, colour:["#ffffff","#ffffff"], font: "04b03", fontsize:8, x:6, y:-1, sourceName:"y2k.neocities.org", sourceURL:"https://y2k.neocities.org"},
    '0001-saucer':        {name:"crash-landed", bday:20211203, frames:2, colour:["#ff0000","#ff4e4e"], font: "Perfect DOS VGA 437", fontsize:16, x:"-14", y:-1, sourceName:"me :)"},
    '0006-purple':        {name:"simple purple", bday:20211201, frames:2, colour:["#000000","#000000"], font: "monaco", fontsize:16, x:0, y:0, sourceName:"me :)"},
    '0008-pink':          {name:"simple pink", bday:20211201, frames:2, colour:["#ff40ff","#ff40ff"], font: "monaco", fontsize:16, x:0, y:0, sourceName:"me :)"},
    '0009-gradient-pink': {name:"gradient pink", bday:20211201, frames:2, colour:["#ff40ff","#ff40ff"], font: "monaco", fontsize:16, x:0, y:0, sourceName:"me :)"},
    '0010-blue':          {name:"simple blue", bday:20211201, frames:2, colour:["#3f3fbf","#3f3fbf"], font: "monaco", fontsize:16, x:0, y:0, sourceName:"me :)"}
};

let styleList = {};
let stylePage = {};
let sourceList = {};
let i = 0;
for (const [key, value] of Object.entries(styleProps)) {
    styleList[key] = { name: value.name, bday:value.bday };
    if (i < 20) {
        stylePage[key] = { name: value.name, bday:value.bday };
        i ++;
    }
    if (value.sourceURL) {
        sourceList[key] = { name: value.name, sourceName: value.sourceName, sourceURL: value.sourceURL };
    }
}

const fontList = {
    1: {name:"Monaco", sourceName:"FontBlast Design", sourceURL:"mailto:jamie@creativeimagesphotography.co.uk"},
    2: {name:"Pixellari", sourceName:"Zacchary Dempsey-Plante", sourceURL:"https://ztdp.ca"},
    3: {name:"Perfect DOS VGA 437", sourceName:"Zeh Fernando", sourceURL:"https://portfolio.zehfernando.com/"},
    4: {name:"04b03", sourceName:"押本祐二", sourceURL:"http://www.04.jp.org/"},
    5: {name:"Infernalda", sourceName:"MrtheNoronha", sourceURL:"http://www.juspifon.com/"},
    6: {name:"Rainy Hearts", sourceName:"Camellina", sourceURL:"mailto:tr.camellina@gmail.com"}
};

module.exports = {
    styleProps,
    styleList,
    stylePage,
    sourceList,
    fontList
}
