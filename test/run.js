#!/usr/bin/env node
process.env.NODE_ENV = 'test';
require('../index');

var Mocha = require('mocha');
var optimist = require('optimist');
var walk_dir = require('./support/walk_dir');

var argv = optimist
    .usage("Usage: $0 -T [types] --reporter [reporter] --timeout [timeout]")
    .default({types: 'unit,component', reporter: 'spec', timeout: 6000})
    .describe('types', 'The types of tests to run, separated by commas. E.g., unit,functional,acceptance')
    .describe('reporter', 'The mocha test reporter to use.')
    .describe('timeout', 'The mocha timeout to use per test (ms).')
    .boolean('bail')
    .describe('bail', 'Bail on first failure')
    .boolean('verbose')
    .describe('verbose', 'Verbose output')
    .boolean('help')
    .alias('types', 'T')
    .alias('timeout', 't')
    .alias('reporter', 'R')
    .alias('bail', 'b')
    .alias('help', 'h')
    .argv;

var mocha = new Mocha({timeout: argv.timeout, reporter: argv.reporter, ui: 'bdd'});
mocha.checkLeaks();
if (argv.bail) {
    mocha.bail();
}

var valid_test_types = ['unit', 'functional', 'acceptance', 'integration'];
var requested_types = argv.types.split(',');
var types_to_use = [];

valid_test_types.forEach(function (valid_test_type) {
    if (requested_types.indexOf(valid_test_type) !== -1) {
        types_to_use.push(valid_test_type);
    }
});

if (argv.help || types_to_use.length === 0) {
    console.log('\n' + optimist.help());
    process.exit();
}

var is_valid_file = function (file) {
    for (var i = 0; i < types_to_use.length; i++) {
        var test_type = types_to_use[i];
        var ext = test_type + ".js";

        if (file.indexOf(ext) !== -1) {
            return true;
        }
    }

    return false;
};

var test_files = [];

function run(cb) {
    walk_dir.walk('test', is_valid_file, function (err, files) {
        if (err) { return cb(err); }

        files.forEach(function (file) {
            test_files.push(file);
            mocha.addFile(file);
        });

        cb();
    });
}

run(function (err) {
    if (err) { throw err; }

    if (argv.verbose) {
        console.log("\nTest files:");
        test_files.forEach(function (file) {
            console.log(file + " \\");
        });
    }
    mocha.run(function (failures) {
        process.exit(failures);
    });
});
