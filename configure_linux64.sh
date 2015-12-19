#!/bin/sh

cwd=$(pwd)

cd ./app/node_modules/font-manager-nw
nw-gyp clean
nw-gyp configure --runtime=node-webkit --target=0.12.3 --target_platform=linux --target_arch=x64
nw-gyp build
cd $cwd

cd ./app/node_modules/sqlite3
node-pre-gyp clean
node-pre-gyp configure --runtime=node-webkit --target=0.12.3 --target_platform=linux --target_arch=x64
node-pre-gyp build
cd $cwd

cd ./app/
npm remove wcjs-prebuilt

WCJS_PLATFORM=linux 
WCJS_ARCH=x64 
WCJS_RUNTIME=nw.js 

npm install wcjs-prebuilt
cd $cwd





