#!/bin/bash

# $1    blinkieID
# $2    style
# $3    intext
# $4    font family
# $5    text pt/px size
# $6    text x offset px
# $7    text y offset px
# $8    text colour frame1
# $9    text colour frame2
# ${10} frame delay centisec


frame1=$(mktemp /tmp/$1-XXXXXX.png)
frame2=$(mktemp /tmp/$1-XXXXXX.png)

convert -pointsize $5 +antialias -page +$6+$7 -gravity Center -family "$4" -fill $8 -draw "text 0,0 '""$3""' " ./assets/blinkies-bg/png/$2-1.png $frame1
convert -pointsize $5 +antialias -page +$6+$7 -gravity Center -family "$4" -fill $9 -draw "text 0,0 '""$3""' " ./assets/blinkies-bg/png/$2-2.png $frame2
convert -page +0+0 -delay ${10} -loop 0 /tmp/${1}* ./assets/blinkies-output/blinkiesCafe-$1.gif
rm $frame1 $frame2
