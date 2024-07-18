<!-- find all of the child folders in a folder and the child folder is using "zh-CN" as the folder name
and log the path, 
then delete them -->
find . -type d -name "zh-CN" -print -exec rm -rf {} \;


<!-- Function to convert uppercase to lowercase and replace spaces with hyphens -->
for file in ./result/zoom-ui-diff/ai-response/*.json; do dir=$(dirname "$file"); base=$(basename "$file"); new_base=$(echo "$base" | tr '[:upper:]' '[:lower:]' | tr ' ' '-'); mv "$file" "$dir/$new_base"; done