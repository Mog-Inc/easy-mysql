var testCase   = require('nodeunit').testCase;
var common     = require('./common');
var settings   = common.settings;
var EasyClient = require('../lib/easy_client');
var mysql      = require('mysql');
var clone      = common.clone;
var mysql_pool = require('../lib/pool');

var db = settings.database;

function check_err(err, test) {
    if (err) {
        if (test) {
            test.ok(false);
        }
        throw new Error(err);
    }
}

var table_sql = "create table widgets( " +
                "id int auto_increment primary key, " +
                "name varchar(25)) ";

function setup_db(cb) {
    var _settings = clone(settings);
    delete _settings.database;
    var client = mysql.createClient(_settings);

    client.query('CREATE DATABASE ' + db, function (err) {
        if (err && err.number != mysql.ERROR_DB_CREATE_EXISTS) {
            throw err;
        }
    });
    client.query('USE ' + db);
    client.query('drop table if exists widgets');
    client.query(table_sql, function (err) {
        check_err(err);
        cb(null, true);
    });
}

module.exports = testCase({
    setUp: function (callback) {
        var self = this;
        setup_db(function (err, result) {
            check_err(err);
            callback();
        });
    },

    "connecting": testCase({
        "directly": function (test) {
            EasyClient.create(settings, function (err, easy_client) {
                check_err(err, test);
                test.equal(easy_client.client.user, settings.user);
                test.equal(easy_client.client.password, settings.password);
                test.equal(easy_client.client.port, settings.port);
                test.equal(easy_client.client.database, settings.database);
                test.done();
            });
        },

        "passing in a generic pool object": function (test) {
            var pool = mysql_pool.get(settings);
            EasyClient.create({pool: pool}, function (err, easy_client) {
                check_err(err, test);
                test.equal(easy_client.client.user, settings.user);
                test.equal(easy_client.client.password, settings.password);
                test.equal(easy_client.client.port, settings.port);
                test.equal(easy_client.client.database, settings.database);
                test.done();
            });
        }
    })
});
