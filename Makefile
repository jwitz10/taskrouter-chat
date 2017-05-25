#caching
BROWSERIFY = ./node_modules/browserify/bin/cmd.js

all: install

install:
	@if [ ! -x ${BROWSERIFY} ]; then echo 'Running `npm install` (should not have to do this again)...'; npm install; fi
	@$(BROWSERIFY) lib/worker.js > public/worker.js
	@$(BROWSERIFY) lib/customer.js > public/customer.js