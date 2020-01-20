#!/bin/bash

set -e

cd ../..
PATH=$(yarn bin):$PATH
cd -
export NODE_ENV=production
BABEL_ENV=cjs babel --source-maps -d lib src
BABEL_ENV=es babel --source-maps -d lib-es src
