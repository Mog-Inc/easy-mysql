var testCase   = require('nodeunit').testCase;
var sinon      = require('sinon');
var EasyClient = require('../lib/easy_client');
var mysql_pool = require('../lib/pool');
var common     = require('./common');
var settings   = common.settings;
var clone      = common.clone;
var check_err  = common.check_err;
var setup_db   = common.setup_db;

module.exports = testCase({
    setUp: function (callback) {
        var self = this;
        setup_db(function (err, result) {
            check_err(err);
            callback();
        });
    },

    "EasyClient.create": testCase({
        "directly": function (test) {
            EasyClient.create(settings, function (err, easy_client) {
                check_err(err, test);
                test.equal(easy_client.client.user, settings.user);
                test.equal(easy_client.client.password, settings.password);
                test.equal(easy_client.client.port, settings.port);
                test.equal(easy_client.client.database, settings.database);
                easy_client.end();
                test.done();
            });
        },

        "passing in a generic pool object": function (test) {
            var pool = mysql_pool.create(settings);
            EasyClient.create({pool: pool}, function (err, easy_client) {
                check_err(err, test);
                test.equal(easy_client.client.user, settings.user);
                test.equal(easy_client.client.password, settings.password);
                test.equal(easy_client.client.port, settings.port);
                test.equal(easy_client.client.database, settings.database);
                easy_client.end();
                test.done();
            });
        },

        "using built-in pool": function (test) {
            var _settings = clone(settings);
            _settings.pool_size = 3;
            EasyClient.create(_settings, function (err, easy_client) {
                check_err(err, test);
                test.equal(easy_client.client.user, settings.user);
                test.equal(easy_client.client.password, settings.password);
                test.equal(easy_client.client.port, settings.port);
                test.equal(easy_client.client.database, settings.database);
                test.ok(easy_client.pool);
                easy_client.end();
                test.done();
            });
        }
    }),

    "end() method": testCase({
        "single client": testCase({
            "disconnects from socket": function (test) {
                EasyClient.create(settings, function (err, easy_client) {
                    check_err(err, test);
                    easy_client.end();

                    setTimeout(function () {
                        test.strictEqual(easy_client.client._socket.destroyed, true);
                    }, 20);
                    test.done();
                });
            }
        }),

        "generic pool object": testCase({
            "releases client back to pool": function (test) {
                var pool = mysql_pool.create(settings);
                var mock = sinon.mock(pool);
                mock.expects("release");
                EasyClient.create({pool: pool}, function (err, easy_client) {
                    check_err(err, test);
                    easy_client.end();
                    mock.verify();
                    test.done();
                });
            }
        })
    })
});
