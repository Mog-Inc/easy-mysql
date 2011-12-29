PACKAGE = easy_mysql
NODEJS = $(if $(shell test -f /usr/bin/nodejs && echo "true"),nodejs,node)
BASE = .

all: test lint doc

test:
	./node_modules/.bin/mocha

lint:
	./node_modules/.bin/jshint lib test --config $(BASE)/.jshintrc && echo "Lint Done"
	
doc:
	./node_modules/jsdoc/app/run.js -t=./node_modules/jsdoc/templates/jsdoc -d=./doc ./lib

.PHONY: test doc
