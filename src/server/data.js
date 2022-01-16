const styleProps = {
    5:  {id:"0005-citystars", name:"city stars", colour1:"#ffffff", colour2:"#ffffff", font: "04b03", fontsize:"8", x:"6", y:"-1", sourceName:"THE NEXUS", sourceURL:"https://y2k.neocities.org"},
    4:  {id:"0004-peachy", name:"just peachy", colour1:"black", colour2:"black", font:"monaco", fontsize:"16", x:"7", y:"0", sourceName:"THE NEXUS", sourceURL:"https://y2k.neocities.org"},
    7:  {id:"0001-saucer", name:"crash-landed", colour1:"#ff0000", colour2:"#ff4e4e", font: "Perfect DOS VGA 437", fontsize:"16", x:"-14", y:"-1", sourceName:"me :)"},
    3:  {id:"0003-ghost", name:"Spooky vibes only!!", colour1:"#e79400", colour2:"#e77400", font: "infernalda", fontsize:"16", x:"-13", y:"-1", sourceName:"THE NEXUS", sourceURL:"https://y2k.neocities.org"},
    6:  {id:"0006-purple", name:"simple purple", colour1:"#800080", colour2:"#800080", font: "monaco", fontsize:"16", x:"0", y:"0", sourceName:"me :)"},
    1:  {id:"0007-chocolate", name:"chocolate dreams", colour1:"#000000", colour2:"#000000", font: "monaco", fontsize:"16", x:"0", y:"0", sourceName:"toloveanangel0", sourceURL:"https://web.archive.org/web/20091027005417/http://www.geocities.com/toloveanangel0/graphics/blinkies/"},
    8:  {id:"0008-pink", name:"simple pink", colour1:"#ff40ff", colour2:"#ff40ff", font: "monaco", fontsize:"16", x:"0", y:"0", sourceName:"me :)"},
    9:  {id:"0009-gradient-pink", name:"gradient pink", colour1:"#ff40ff", colour2:"#ff40ff", font: "monaco", fontsize:"16", x:"0", y:"0", sourceName:"me :)"},
    10: {id:"0010-blue", name:"simple blue", colour1:"#3f3fbf", colour2:"#3f3fbf", font: "monaco", fontsize:"16", x:"0", y:"0", sourceName:"me :)"}
};

let styleList = {};
let sourceList = {};
for (const [key, value] of Object.entries(styleProps)) {
  styleList[key] = { id: value.id, name: value.name };
  sourceList[key] = { name: value.name, sourceName: value.sourceName, sourceURL: value.sourceURL };
}

const fontList = {
    1: {name:"Monaco", sourceName:"FontBlast Design", sourceURL:"mailto:jamie@creativeimagesphotography.co.uk"},
    2: {name:"Pixellari", sourceName:"Zacchary Dempsey-Plante", sourceURL:"https://ztdp.ca"},
    3: {name:"Perfect DOS VGA 437", sourceName:"Zeh Fernando", sourceURL:"http://portfolio.zehfernando.com"},
    4: {name:"04b03", sourceName:"押本祐二", sourceURL:"http://www.04.jp.org/"},
    5: {name:"Infernalda", sourceName:"MrtheNoronha", sourceURL:"http://www.juspifon.com/"}
};

module.exports = {
    styleProps,
    styleList,
    sourceList,
    fontList
}
