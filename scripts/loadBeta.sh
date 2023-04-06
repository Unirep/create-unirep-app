#!/bin/sh

set -e

WORKDIR=$(mktemp)
TARFILE=$WORKDIR/unirep-beta-1-3.tar.gz

wget https://pub-0a2a0097caa84eb18d3e5c165665bffb.r2.dev/unirep-beta-1-3.tar.gz -P $WORKDIR  --progress=bar:force:noscroll

shasum -a 256 $TARFILE | grep '3bf9a8ed793c4351be4d673c46b203bf341a32a31a41d2b54d16815264a50e12'

rm -rf node_modules/@unirep
tar -xzf $TARFILE -C node_modules
mv node_modules/unirep-beta-1-3 node_modules/@unirep
