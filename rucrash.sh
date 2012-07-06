#!/bin/sh

url=""
play=0

# parse options
while [ "$1" != "" ]
do
	arg="$1"
	shift
	case "$arg" in
		-p|--play)
			play=1
			;;
		*)
			url="$arg"
		;;
	esac
done

if test -z "$url"; then
	cat <<USE
Usage: $0 [OPTIONS] <URL>
    <URL> - is an URL of ru-chp post (e.g. http://ru-chp.livejournal.com/12345.html)

OPTIONS are:
    -p, --play Play file after downloading with VLC player
USE
	exit
fi

# check prerequisites
pres=( curl wget )
if [ $play -ne 0 ]; then
	# push "vlc" to prerequisites if --play is defined
	pres[${#pres[@]}]="vlc"
fi

for pre in ${pres[@]}
do
	echo Check existence of \"$pre\"...
	if test -z "$(which "$pre" 2>/dev/null)"; then
		echo "There is no \"$pre\" installed"
		exit 1
	fi
done

RUCRASH="http://video.rucrash.com/ruchp/"
URL=$(basename "$url")
URL="${RUCRASH}${URL%%.*}.mp4"
PLAYER=vlc
echo $URL
cd ~/Downloads
wget -c "$URL"
if [ $play -eq 1 ]; then
	$PLAYER "$(basename "$URL")"
fi
