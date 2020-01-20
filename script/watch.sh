#!/bin/bash

set -e

cd ../..
PATH=$(yarn bin):$PATH
cd -
export NODE_ENV=production
BABEL_ENV=cjs babel —-extensions '.ts' --source-maps --watch -d lib src --config-file ../../babel.config.js &
BABEL_ENV=es babel —-extensions '.ts' --source-maps --watch -d lib-es src --config-file ../../babel.config.js &
