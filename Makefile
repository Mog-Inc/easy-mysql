PACKAGE = easy_mysql
NODEJS = $(if $(shell test -f /usr/bin/nodejs && echo "true"),nodejs,node)
BASE = .
test:
	./node_modules/nodeunit/bin/nodeunit --reporter nested test/easy_mysql.unit.js

lint:
	./node_modules/jshint/bin/hint lib test --config $(BASE)/.jshintrc && echo "Lint Done"
	

.PHONY: test
