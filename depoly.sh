# deploy.sh
# 错误时停止
set -e

# 打包
npm run docs:build

# 进入生成的文件夹
cd docs/.vuepress/dist

# 提交到本地仓库

git init
git add -A
git commit -m $1

# 提交到 https://github.com/lfange/lfange.github.io.git 的 gh-pages 分支
git push -f https://github.com/lfange/lfange.github.io.git master:gh-pages

cd -