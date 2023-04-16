#!/bin/sh

set -e

WORKDIR=$(mktemp)
TARFILE=$WORKDIR/keys.tar.gz

wget https://keys.unirep.io/2-beta-2/keys.tar.gz -P $WORKDIR --progress=bar:force:noscroll

shasum -a 256 $TARFILE | grep '008e18873485ab3d81194fe17819d2b7e0d3bc40d9c5374c63e6450ce87efa25'

tar -xzf $TARFILE -C packages/relay
mv packages/relay/zksnarkBuild packages/relay/keys
