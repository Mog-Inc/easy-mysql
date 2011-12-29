var assert     = require('assert');
var sinon      = require('sinon');
var EasyClient = require('../lib/easy_client');
var easy_pool  = require('../lib/easy_pool');
var common     = require('./common');
var settings   = common.settings;
var clone      = common.clone;
var check_err  = common.check_err;
var setup_db   = common.setup_db;

describe("EasyClient", function () {
    beforeEach(function (done) {
        setup_db(function (err, result) {
            check_err(err);
            done();
        });
    });

    describe("EasyClient.fetch", function () {
        describe("directly", function () {
            it("sets up single client with supplied settings", function (done) {
                EasyClient.fetch(settings, function (err, easy_client) {
                    check_err(err);
                    assert.equal(easy_client.client.user, settings.user);
                    assert.equal(easy_client.client.password, settings.password);
                    assert.equal(easy_client.client.port, settings.port);
                    assert.equal(easy_client.client.database, settings.database);
                    easy_client.end();
                    done();
                });
            });
        });

        describe("passing in a generic pool object", function () {
            it("uses clients from supplied pool", function (done) {
                var pool = easy_pool.fetch(settings);
                EasyClient.fetch({pool: pool}, function (err, easy_client) {
                    check_err(err);
                    assert.equal(easy_client.client.user, settings.user);
                    assert.equal(easy_client.client.password, settings.password);
                    assert.equal(easy_client.client.port, settings.port);
                    assert.equal(easy_client.client.database, settings.database);
                    easy_client.end();
                    done();
                });
            });
        });

        describe("using built-in pool", function () {
            it("sets up pool and uses its clients", function (done) {
                var _settings = clone(settings);
                _settings.pool_size = 3;
                _settings.use_easy_pool = true;
                EasyClient.fetch(_settings, function (err, easy_client) {
                    check_err(err);
                    assert.equal(easy_client.client.user, settings.user);
                    assert.equal(easy_client.client.password, settings.password);
                    assert.equal(easy_client.client.port, settings.port);
                    assert.equal(easy_client.client.database, settings.database);
                    assert.ok(easy_client.pool);
                    easy_client.end();
                    done();
                });
            });
        });
    });

    describe("end() method", function () {
        describe("when using single client", function () {
            it("disconnects from socket", function (done) {
                EasyClient.fetch(settings, function (err, easy_client) {
                    check_err(err);
                    easy_client.end();

                    setTimeout(function () {
                        assert.strictEqual(easy_client.client._socket.destroyed, true);
                    }, 20);
                    done();
                });
            });
        });

        describe("when using generic pool object", function () {
            it("releases client back to pool", function (done) {
                var pool = easy_pool.fetch(settings);
                var mock = sinon.mock(pool);
                mock.expects("release");
                EasyClient.fetch({pool: pool}, function (err, easy_client) {
                    check_err(err);
                    easy_client.end();
                    mock.verify();
                    done();
                });
            });
        });
    });
});
