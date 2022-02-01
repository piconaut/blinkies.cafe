const styleProps = {
    '0007-chocolate':   {name:"chocolate dreams", frames:2, colour1:"#000000", colour2:"#000000", font: "monaco", fontsize:16, x:0, y:0, sourceName:"toloveanangel0", sourceURL:"https://web.archive.org/web/20091027005417/http://www.geocities.com/toloveanangel0/graphics/blinkies/"},
    '0002-mushroom':   {name:"mushroom boy", frames:2, colour1:"#8c2000", colour2:"#8c2000", font: "monaco", fontsize:16, x:0, y:0, sourceName:"me :)"},
    '0013-starryeyes': {name:"Starry Eyes!", frames:3, colour1:"#002984", colour2:"#002984", colour3:"#002984", font: "rainyhearts", fontsize:16, x:-4, y:0, sourceName:"Crazifleebs05", sourceURL:"https://web.archive.org/web/20091027021040/http://geocities.com/crazifleebs05/"},
    '0003-ghost':   {name:"spooky vibes only", frames:2, colour1:"#e79400", colour2:"#e77400", font: "infernalda", fontsize:16, x:-13, y:-1, sourceName:"y2k.neocities.org", sourceURL:"https://y2k.neocities.org"},
    '0004-peachy':   {name:"just peachy", frames:2, colour1:"black", colour2:"black", font:"monaco", fontsize:16, x:7, y:0, sourceName:"y2k.neocities.org", sourceURL:"https://y2k.neocities.org"},
    '0005-citystars':   {name:"city stars", frames:2, colour1:"#ffffff", colour2:"#ffffff", font: "04b03", fontsize:8, x:6, y:-1, sourceName:"y2k.neocities.org", sourceURL:"https://y2k.neocities.org"},
    '0011-frog':   {name:"frog friend", frames:2, colour1:"#000000", colour2:"#000000", font: "monaco", fontsize:16, x:0, y:0, sourceName:"me :)"},
    '0001-saucer':   {name:"crash-landed", frames:2, colour1:"#ff0000", colour2:"#ff4e4e", font: "Perfect DOS VGA 437", fontsize:16, x:"-14", y:-1, sourceName:"me :)"},
    '0012-kiss': {name:"good kisser", frames:2, colour1:"#feaaaa", colour2:"#feaaaa", font: "monaco", fontsize:16, x:0, y:0, sourceName:"y2k.neocities.org", sourceURL:"https://y2k.neocities.org"},
    '0006-purple': {name:"simple purple", frames:2, colour1:"#000000", colour2:"#000000", font: "monaco", fontsize:16, x:0, y:0, sourceName:"me :)"},
    '0008-pink': {name:"simple pink", frames:2, colour1:"#ff40ff", colour2:"#ff40ff", font: "monaco", fontsize:16, x:0, y:0, sourceName:"me :)"},
    '0009-gradient-pink': {name:"gradient pink", frames:2, colour1:"#ff40ff", colour2:"#ff40ff", font: "monaco", fontsize:16, x:0, y:0, sourceName:"me :)"},
    '0010-blue': {name:"simple blue", frames:2, colour1:"#3f3fbf", colour2:"#3f3fbf", font: "monaco", fontsize:16, x:0, y:0, sourceName:"me :)"}
};

let styleList = {};
let sourceList = {};
for (const [key, value] of Object.entries(styleProps)) {
  styleList[key] = { name: value.name };
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
    sourceList,
    fontList
}
