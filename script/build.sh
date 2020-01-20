#!/bin/bash

set -e

cd ../..
PATH=$(yarn bin):$PATH
cd -
export NODE_ENV=production
BABEL_ENV=cjs babel --extensions '.ts' --source-maps -d lib src
BABEL_ENV=es babel --extensions '.ts' --source-maps -d lib-es src
