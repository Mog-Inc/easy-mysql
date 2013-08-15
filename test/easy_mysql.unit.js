var assert = require('assert');
var sinon = require('sinon');
var common = require('./common');
var EasyMySQL = common.EasyMySQL;
var EasyClient = require('../lib/easy_client');
var easy_pool = common.easy_pool;
var settings = common.settings;
var clone = common.clone;
var setup_db = common.setup_db;

describe('EasyMySQL', function () {
    var easy_mysql;

    before(function (done) {
        setup_db(function (err) {
            assert.ifError(err);
            easy_mysql = EasyMySQL.connect(settings.db1);
            done();
        });
    });

    beforeEach(function (done) {
        easy_mysql.execute("truncate widgets", function (err) {
            assert.ifError(err);
            setTimeout(function () {
                done();
            }, 10);
        });
    });

    var execute_funcs = ['execute', 'query'];

    execute_funcs.forEach(function (meth) {
        describe(meth, function () {
            describe("valid queries", function () {
                describe("with params", function () {
                    it("passes query and params to mysql", function (done) {
                        var sql = "insert into widgets(name) values (?)";

                        easy_mysql[meth](sql, ['foo'], function (err, result) {
                            assert.ifError(err);
                            assert.strictEqual(err, null);
                            assert.ok(result);
                            var sql = "select * from widgets";
                            easy_mysql.execute(sql, function (err, results) {
                                assert.equal(results[0].name, 'foo');
                                done();
                            });
                        });
                    });
                });

                describe("without params", function () {
                    it("passes query to mysql", function (done) {
                        var sql = "insert into widgets(name) values ('bob')";

                        easy_mysql[meth](sql, function (err, result) {
                            assert.ifError(err);
                            assert.strictEqual(err, null);
                            assert.ok(result);
                            var sql = "select * from widgets";
                            easy_mysql.execute(sql, function (err, results) {
                                assert.equal(results[0].name, 'bob');
                                done();
                            });
                        });
                    });
                });
            });

            describe("with invalid query", function () {
                it("calls done with error", function (done) {
                    var sql = "BOGUSselect * from widgets where id = ?";
                    easy_mysql[meth](sql, [1], function (err, result) {
                        assert.ok(err instanceof Error);
                        assert.strictEqual(result, null);
                        done();
                    });
                });
            });
        });
    });

    var get_one_funcs = ['get_one', 'getOne', 'one'];

    get_one_funcs.forEach(function (getter) {
        describe(getter, function () {
            beforeEach(function (done) {
                var sql = "insert into widgets(name) values ('bob'), ('jim')";
                easy_mysql.execute(sql, function (err) {
                    assert.ifError(err);
                    done();
                });
            });

            describe("valid queries", function () {
                describe("with params", function () {
                    it("passes query and params to mysql, returns single object", function (done) {
                        var sql = "select * from widgets where name = ?";
                        easy_mysql[getter](sql, ['bob'], function (err, result) {
                            assert.ifError(err);
                            assert.strictEqual(err, null);
                            assert.equal(result.name, 'bob');
                            done();
                        });
                    });
                });

                describe("without params", function () {
                    it("passes query to mysql, returns single object", function (done) {
                        var sql = "select name from widgets order by name desc limit 1";
                        easy_mysql[getter](sql, function (err, result) {
                            assert.ifError(err);
                            assert.strictEqual(err, null);
                            assert.equal(result.name, 'jim');
                            done();
                        });
                    });
                });

                describe("when no results found", function () {
                    it("returns null", function (done) {
                        var sql = "select * from widgets where name = ?";
                        easy_mysql[getter](sql, ['not real'], function (err, result) {
                            assert.ifError(err);
                            assert.strictEqual(err, null);
                            assert.strictEqual(result, null);
                            done();
                        });
                    });
                });
            });

            describe("with invalid query", function () {
                it("calls done with error", function (done) {
                    var sql = "BOGUSselect * from widgets";
                    easy_mysql[getter](sql, function (err, result) {
                        assert.ok(err instanceof Error);
                        assert.strictEqual(result, null);
                        done();
                    });
                });
            });
        });
    });

    var get_all_funcs = ['get_all', 'getAll', 'all'];

    get_all_funcs.forEach(function (getter) {
        describe(getter, function () {
            beforeEach(function (done) {
                var sql = "insert into widgets(name) values ('bob'), ('jim')";
                easy_mysql.execute(sql, function (err) {
                    assert.ifError(err);
                    done();
                });
            });

            describe("valid queries", function () {
                describe("with params", function () {
                    it("passes query and params to mysql, returns results array", function (done) {
                        var sql = "select * from widgets where name = ?";
                        easy_mysql[getter](sql, ['bob'], function (err, results) {
                            assert.ifError(err);
                            assert.strictEqual(err, null);
                            assert.ok(Array.isArray(results));
                            assert.equal(results[0].name, 'bob');
                            done();
                        });
                    });
                });

                describe("without params", function () {
                    it("passes query to mysql, returns results array", function (done) {
                        var sql = "select name from widgets order by name desc";
                        easy_mysql[getter](sql, function (err, results) {
                            assert.ifError(err);
                            assert.strictEqual(err, null);
                            assert.ok(Array.isArray(results));
                            assert.equal(results.length, 2);
                            assert.equal(results[0].name, 'jim');
                            done();
                        });
                    });
                });

                describe("when no results found", function () {
                    it("returns empty array", function (done) {
                        var sql = "select * from widgets where name = ?";
                        easy_mysql[getter](sql, ['not real'], function (err, results) {
                            assert.ifError(err);
                            assert.strictEqual(err, null);
                            assert.ok(Array.isArray(results));
                            assert.equal(results.length, 0);
                            done();
                        });
                    });
                });
            });

            describe("with invalid query", function () {
                it("calls done with error", function (done) {
                    var sql = "BOGUSselect * from widgets";
                    easy_mysql[getter](sql, function (err, results) {
                        assert.ok(err instanceof Error);
                        assert.strictEqual(results, null);
                        done();
                    });
                });
            });
        });
    });

    describe("logging", function () {
        var log_settings;
        var easy_client;

        beforeEach(function (done) {
            log_settings = clone(settings.db1);
            log_settings.logging = {
                logger: common.fake_logger,
                events: {
                    error: {level: 'warn'}
                }
            };

            easy_mysql = EasyMySQL.connect(log_settings);

            EasyClient.fetch(log_settings, function (err, result) {
                assert.ifError(err);
                easy_client = result;

                sinon.stub(EasyClient, 'fetch', function (settings, cb) {
                    cb(null, easy_client);
                });

                done();
            });
        });

        afterEach(function () {
            EasyClient.fetch.restore();
        });

        it("lets us specify a logger in settings", function () {
            assert.ok(easy_mysql.logging);
        });

        it("logs error events at specified level", function (done) {
            sinon.spy(common.fake_logger, 'warn');

            var error = new Error('foo');

            sinon.stub(easy_client, 'query', function (sql, query_params, cb) {
                cb(error);
            });

            easy_mysql.execute("select * from widgets", function (err) {
                assert.equal(err, error);
                assert.ok(common.fake_logger.warn.called);
                easy_client.query.restore();
                common.fake_logger.warn.restore();
                done();
            });
        });
    });

    describe("connecting with pools", function () {
        beforeEach(function (done) {
            setup_db(done);
        });

        it("lets us specify a logger in settings", function () {
            var pool = easy_pool.fetch(settings.db1);
            var logging = {
                logger: common.fake_logger,
                events: {
                    error: {level: 'warn'}
                }
            };

            easy_mysql = EasyMySQL.connect_with_pool(pool, {logging: logging});
            assert.ok(easy_mysql.logging);
        });

        describe("EasyMysql.connect_with_pool", function () {
            it("lets us execute queries", function (done) {
                var pool = easy_pool.fetch(settings.db1);
                easy_mysql = EasyMySQL.connect_with_pool(pool);
                var sql  = "insert into widgets(name) values (?)";

                easy_mysql.execute(sql, ['foo'], function (err, result) {
                    assert.ifError(err);
                    assert.strictEqual(err, null);
                    assert.ok(result);
                    var sql = "select * from widgets";
                    easy_mysql.execute(sql, function (err, results) {
                        assert.equal(results[0].name, 'foo');
                        done();
                    });
                });
            });
        });

        describe("EasyMysql.connect_with_easy_pool", function () {
            it("lets us execute queries", function (done) {
                var easy_pool_settings = clone(settings.db1);
                easy_mysql = EasyMySQL.connect_with_easy_pool(easy_pool_settings);
                var sql  = "insert into widgets(name) values (?)";

                easy_mysql.execute(sql, ['foo'], function (err, result) {
                    assert.ifError(err);
                    assert.strictEqual(err, null);
                    assert.ok(result);
                    var sql = "select * from widgets";
                    easy_mysql.execute(sql, function (err, results) {
                        assert.equal(results[0].name, 'foo');
                        done();
                    });
                });
            });
        });
    });
});
