var assert     = require('assert');
var sinon      = require('sinon');
var common     = require('./common');
var EasyClient = common.EasyClient;
var easy_pool  = common.easy_pool;
var settings   = common.settings;
var clone      = common.clone;
var setup_db   = common.setup_db;

var assert_correct_settings = function (client) {
    assert.equal(client.user, settings.user);
    assert.equal(client.password, settings.password);
    assert.equal(client.port, settings.port);
    assert.equal(client.database, settings.database);
};

describe("EasyClient", function () {
    beforeEach(function (done) {
        setup_db(function (err, result) {
            assert.ifError(err);
            done();
        });
    });

    describe("EasyClient.fetch", function () {
        describe("connecting directly", function () {
            it("sets up single client with supplied settings", function (done) {
                EasyClient.fetch(settings, function (err, easy_client) {
                    assert.ifError(err);
                    assert_correct_settings(easy_client.client);
                    easy_client.end();
                    done();
                });
            });
        });

        describe("passing in a generic pool object", function () {
            it("uses clients from supplied pool", function (done) {
                var pool = easy_pool.fetch(settings);
                EasyClient.fetch({pool: pool}, function (err, easy_client) {
                    assert.ifError(err);
                    assert_correct_settings(easy_client.client);
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
                    assert.ifError(err);
                    assert_correct_settings(easy_client.client);
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
                    assert.ifError(err);
                    easy_client.end();

                    setTimeout(function () {
                        assert.strictEqual(easy_client.client._socket.destroyed, true);
                        done();
                    }, 20);
                });
            });
        });

        describe("when using generic pool object", function () {
            it("releases client back to pool", function (done) {
                var pool = easy_pool.fetch(settings);
                var mock = sinon.mock(pool);
                mock.expects("release");
                EasyClient.fetch({pool: pool}, function (err, easy_client) {
                    assert.ifError(err);
                    easy_client.end();
                    mock.verify();
                    done();
                });
            });
        });
    });
});
