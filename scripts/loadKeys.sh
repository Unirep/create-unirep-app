#!/bin/sh

set -e

WORKDIR=$(mktemp)
TARFILE=$WORKDIR/keys.tar.gz

wget https://keys.unirep.io/2-beta-1/keys.tar.gz -P $WORKDIR --progress=bar:force:noscroll

shasum -a 256 $TARFILE | grep '99891da0525f617ba382e18e2cc6c9b55d45b55711dd789403d31b3945e44e34'

tar -xzf $TARFILE -C packages/relay
mv packages/relay/zksnarkBuild packages/relay/keys
