PACKAGE = easy_mysql
BASE = .


ISTANBUL = ./node_modules/.bin/istanbul
TEST_COMMAND = NODE_ENV=test ./node_modules/.bin/mocha
COVERAGE_OPTS = --lines 87 --statements 87 --branches 77 --functions 95

main: lint test

cover:
	$(ISTANBUL) cover test/run.js -- -T unit,functional

check-coverage:
	$(ISTANBUL) check-coverage $(COVERAGE_OPTS)

test: cover check-coverage


test-cov: cover check-coverage
	open coverage/lcov-report/index.html

lint:
	./node_modules/.bin/jshint ./lib --config $(BASE)/.jshintrc && \
	./node_modules/.bin/jshint ./test --config $(BASE)/.jshintrc

doc:
	./node_modules/jsdoc-toolkit/app/run.js -t=./node_modules/jsdoc-toolkit/templates/jsdoc -d=./doc ./lib

.PHONY: test doc
