#!/bin/sh

for FILE in *.mp3
do
rm raw
mpg321 ${FILE} -w raw
oggenc -q 2 raw -o ${FILE%mp3}ogg
oggenc --downmix -q 1 raw -o lowquality/${FILE%mp3}ogg
lame --preset voice raw lowquality/${FILE%mp3}mp3
rm raw
done

#for fic in "*.mp3" ; do
#echo $fic
#echo ""
#ffmpeg -i "${fic}" "${fic}.ogg"
#done