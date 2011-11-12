var testCase   = require('nodeunit').testCase;
var common     = require('./common');
var settings   = common.settings;
var EasyClient = require('../lib/easy_client');
var mysql_pool = require('../lib/pool');
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
