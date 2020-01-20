#!/bin/bash

set -e

cd ../..
PATH=$(yarn bin):$PATH
cd -
export NODE_ENV=production
tsc --emitDeclarationOnly && BABEL_ENV=cjs babel --extensions '.ts' -d lib src
tsc --emitDeclarationOnly && BABEL_ENV=es babel --extensions '.ts' -d lib-es src
