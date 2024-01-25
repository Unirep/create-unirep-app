#!/bin/sh

rm -rf ./public/keys
mkdir -p ./public/keys

# Copy the proving key
CIRCUIT_NAME="dataProof"
for file in ../circuits/zksnarkBuild/$CIRCUIT_NAME.*; do
    cp -r $file ./public/keys/
done