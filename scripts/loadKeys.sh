#!/bin/sh

set -e

WORKDIR=$(mktemp)
TARFILE=$WORKDIR/keys.tar.gz

wget https://keys.unirep.io/2-beta-3/keys.tar.gz -P $WORKDIR --progress=bar:force:noscroll

shasum -a 256 $TARFILE | grep '674b77478c59a02f58cdf3a4090bb6db415adbd75a826a472fa4321145b672fb'

tar -xzf $TARFILE -C packages/relay
mv packages/relay/zksnarkBuild packages/relay/keys
