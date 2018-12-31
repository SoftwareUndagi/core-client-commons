#!/bin/bash
cd node_modules
rm -rf base-commons-module
mkdir base-commons-module
cd base-commons-module
ln -s ../../../base-commons-module/dist/
ln -s ../../../base-commons-module/package.json
