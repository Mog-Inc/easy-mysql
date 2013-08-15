var assert = require('assert');
var sinon = require('sinon');
var common = require('./common');
var EasyClient = common.EasyClient;
var easy_pool = common.easy_pool;
var settings = common.settings;
var clone = common.clone;
var setup_db = common.setup_db;

var assert_correct_settings = function (client, expected_settings) {
    var config = client;
    if (client.config) {
        config = client.config;
    }
    assert.equal(config.user, expected_settings.user);
    assert.equal(config.password, expected_settings.password);
    assert.equal(config.port, expected_settings.port);
    assert.equal(config.database, expected_settings.database);
};

describe("EasyClient", function () {
    beforeEach(function (done) {
        setup_db(done);
    });

    describe("EasyClient.fetch", function () {
        describe("connecting directly", function () {
            it("sets up single client with supplied settings", function (done) {
                EasyClient.fetch(settings.db1, function (err, easy_client) {
                    assert.ifError(err);
                    assert_correct_settings(easy_client.client, settings.db1);
                    easy_client.end();
                    done();
                });
            });
        });

        describe("passing in a generic pool object", function () {
            it("uses clients from supplied pool", function (done) {
                var pool = easy_pool.fetch(settings.db1);
                EasyClient.fetch({pool: pool}, function (err, easy_client) {
                    assert.ifError(err);
                    assert_correct_settings(easy_client.client, settings.db1);
                    easy_client.end();
                    done();
                });
            });
        });

        describe("using built-in pool", function () {
            beforeEach(function (done) {
                common.setup_db2(done);
            });

            it("sets up pool and uses its clients", function (done) {
                var _settings = clone(settings.db1);
                _settings.pool_size = 3;
                _settings.use_easy_pool = true;
                EasyClient.fetch(_settings, function (err, easy_client) {
                    assert.ifError(err);
                    assert_correct_settings(easy_client.client, _settings);
                    assert.ok(easy_client.pool);
                    easy_client.end();
                    done();
                });
            });

            it("allows using multiple pools", function (done) {
                var db1_settings = clone(settings.db1);
                var db2_settings = clone(settings.db2);
                db1_settings.pool_size = 3;
                db1_settings.use_easy_pool = true;
                db2_settings.pool_size = 3;
                db2_settings.use_easy_pool = true;

                EasyClient.fetch(db1_settings, function (err, easy_client1) {
                    assert.ifError(err);

                    EasyClient.fetch(db2_settings, function (err, easy_client2) {
                        assert.ifError(err);

                        var config1 = easy_client1.client;
                        if (easy_client1.client.config) {
                            config1 = easy_client1.client.config;
                        }

                        var config2 = easy_client2.client;
                        if (easy_client2.client.config) {
                            config2 = easy_client2.client.config;
                        }

                        assert.equal(config1.database, db1_settings.database);
                        assert.equal(config2.database, db2_settings.database);

                        easy_client1.end();
                        easy_client2.end();
                        done();
                    });
                });
            });
        });
    });

    describe("end() method", function () {
        describe("when using single client", function () {
            it("disconnects from socket", function (done) {
                EasyClient.fetch(settings.db1, function (err, easy_client) {
                    assert.ifError(err);
                    easy_client.end();

                    setTimeout(function () {
                        var destroyed = false;
                        try {
                            destroyed = easy_client.client._socket.destroyed;
                        } catch (e) {
                            destroyed = easy_client.client._connection.destroyed;
                        }
                        assert.strictEqual(destroyed, true);
                        done();
                    }, 20);
                });
            });
        });

        describe("when using generic pool object", function () {
            it("releases client back to pool", function (done) {
                var pool = easy_pool.fetch(settings.db1);
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
