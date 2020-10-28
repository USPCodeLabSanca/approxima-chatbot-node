#!/bin/sh

declare -a arr=("TOREMOVE" "TODEL" "TODELETE")

for i in "${arr[@]}"
do
    git diff --cached --name-only | xargs grep --with-filename -n $i && echo "COMMIT REJECTED! Found '$i' references. Please remove them before commiting." && exit 1
done

exit 0