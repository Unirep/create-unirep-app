#!/bin/sh

set -e

# Pass an argument to this script that is the unirep monorepo directory
# this argument must be absolute
# e.g. yarn linkUnirep $(pwd)/../unirep

rm -rf node_modules/@unirep/core
rm -rf node_modules/@unirep/contracts
rm -rf node_modules/@unirep/utils
rm -rf node_modules/@unirep/circuits
cp -r $1/packages/core/build $(pwd)/node_modules/@unirep/core
cp -r $1/packages/contracts/build $(pwd)/node_modules/@unirep/contracts
cp -r $1/packages/utils/build $(pwd)/node_modules/@unirep/utils
cp -r $1/packages/circuits/dist $(pwd)/node_modules/@unirep/circuits
