var async     = require('async');
var assert    = require('assert');
var common    = require('./common');
var EasyMySQL = common.EasyMySQL;
var easy_pool = common.easy_pool;
var settings  = common.settings;
var clone     = common.clone;
var setup_db  = common.setup_db;

describe('EasyMySQL stress tests', function () {
    var easy_mysql;

    before(function (done) {
        easy_mysql = EasyMySQL.connect_with_easy_pool(settings.db1);

        var table_sql = "create table widgets( " +
            "id int auto_increment primary key, " +
            "name varchar(25)) Engine=InnoDB";

        easy_mysql.execute('drop table if exists widgets', function(err, result) {
            assert.ifError(err);

            easy_mysql.execute(table_sql, function (err, result) {
                assert.ifError(err);
                done();
            });
        });
    });

    beforeEach(function(done) {
        easy_mysql.execute('truncate widgets', function(err, result) {
            assert.ifError(err);
            done();
        });
    });

    describe('inserting and selecting', function () {
        it('lets us insert and get results multiple times', function (done) {
            this.timeout(10000);
            var qty = 500;
            var test_runs = [];
            for (var i = 0; i < qty; i++) {
                test_runs.push(i);
            }

            async.forEachSeries(test_runs, function (test_run, async_cb) {
                var name = common.random_string();
                var sql = "insert into widgets(name) values (?)";
                easy_mysql.execute(sql, [name], function (err, result) {
                    if (err) { return async_cb(err); }

                    sql = "select * from widgets where name = ?";
                    easy_mysql.get_one(sql, [name], function (err, result) {
                        assert.ok(result, "Expected result when querying for name " + name);
                        async_cb(err, result);
                    });
                });
            }, function (err) {
                assert.ifError(err);
                done();
            });
        });

        it('lets us insert and get results multiple times, again', function (done) {
            this.timeout(10000);
            var qty = 50;
            var test_runs = [];
            for (var i = 0; i < qty; i++) {
                test_runs.push(i);
            }

            async.forEachSeries(test_runs, function (test_run, async_cb) {
                var name = common.random_string();
                var sql = "insert into widgets(name) values (?)";
                easy_mysql.execute(sql, [name], function (err, result) {
                    if (err) { return async_cb(err); }

                    sql = "select * from widgets where name = ?";
                    easy_mysql.get_one(sql, [name], function (err, result) {
                        assert.ok(result, "Expected result when querying for name " + name);
                        async_cb(err, result);
                    });
                });
            }, function (err) {
                assert.ifError(err);
                done();
            });
        });
    });
});
