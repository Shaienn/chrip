#!/bin/sh

cwd=$(pwd)

cd ./app/node_modules/font_manager_nw
nw-gyp clean
nw-gyp configure --runtime=node-webkit --target=0.12.3 --target_platform=linux --target_arch=ia32
nw-gyp build
cd cwd

cd ./app/node_modules/sqlite3
node-pre-gyp clean
node-pre-gyp configure --runtime=node-webkit --target=0.12.3 --target_platform=linux --target_arch=ia32
node-pre-gyp build
cd cwd

cd ./app/
npm remove wcjs-prebuilt

WCJS_PLATFORM=win 
WCJS_ARCH=ia32 
WCJS_RUNTIME=nw.js 

npm install wcjs-prebuilt
cd cwd





