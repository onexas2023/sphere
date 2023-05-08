
FOLDER=$1
KEYWORD=$2
REPLACE=$3

if [[ -z $FOLDER ]] || [[ -z $KEYWORD ]] || [[ -z $REPLACE ]]; then
	echo 'Usage:'
	echo -e '\t FOLDER KEYWORD REPLACE, e.g ../zechspace 2.1.0.DEV-SANPSHOT 2.1.0'
fi

#escape KEYWORD
ESC_KEYWORD=$(echo $KEYWORD | sed -e 's/[]\/$*.^|[]/\\&/g')
cd $FOLDER
for file in `find . -type f \( -name "ver.ts" -o -name "*.json" -o -name "*.env" \)`; do
	if grep -q "$ESC_KEYWORD" $file; then
		echo "Replace version $KEYWORD to $REPLACE in $file!"
		sed -i "s/$ESC_KEYWORD/$REPLACE/g" $file
	fi  
done

