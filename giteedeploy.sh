#!/usr/bin/env sh

# deploy.sh
# 错误时停止
set -e

# 打包
npm run docs:build

# 进入生成的文件夹
cd docs/.vuepress/dist

echo "$(pwd)"

#创建.nojekyll 防止Github Pages build错误
touch .nojekyll

# 提交到本地仓库

# echo "提交到本地仓库 $(git status)"
echo "commit $1"
git init
git add -A
git commit -m "commit > $1"

echo "\$1的值 $1, status:>>   $(git status)"

# 提交到 https://gitee.com/lfange/lfange.github.io.git 的 gh-pages 分支
git push -f https://gitee.com/lfange/lfange.github.io.git master:gh-pages

cd .. 

echo "cd ..>> $(pwd)"

rm -r-f dist && rmdir dist


echo "finish!!!"

cd -