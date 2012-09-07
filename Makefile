PACKAGE = easy_mysql
NODEJS = $(if $(shell test -f /usr/bin/nodejs && echo "true"),nodejs,node)
BASE = .

all: test lint doc

test:
	./node_modules/.bin/mocha

test-cov: lib-cov
	EASY_MYSQL_JSCOV=1 ./node_modules/.bin/mocha --reporter html-cov > coverage.html && echo 'coverage saved to coverage.html'

lib-cov:
	@rm -fr ./$@
	@jscoverage lib $@

lint:
	./node_modules/.bin/jshint lib test --config $(BASE)/.jshintrc && echo "Lint Done"
	
doc:
	./node_modules/jsdoc-toolkit/app/run.js -t=./node_modules/jsdoc-toolkit/templates/jsdoc -d=./doc ./lib

.PHONY: test doc
