var testCase  = require('nodeunit').testCase;
var common    = require('./common');
var settings  = common.settings;
var EasyMySQL = require('../lib/easy_mysql');
var easy_pool = require('../lib/easy_pool');
var check_err = common.check_err;
var setup_db  = common.setup_db;

module.exports = testCase({
    setUp: function (callback) {
        var self = this;
        setup_db(function (err, result) {
            check_err(err);
            self.easy = new EasyMySQL(settings);
            callback();
        });
    },

    "execute": testCase({
        "valid queries": testCase({
            "with params": function (test) {
                var self = this;
                var sql = "insert into widgets(name) values (?)";

                self.easy.execute(sql, ['foo'], function (err, result) {
                    check_err(err, test);
                    test.strictEqual(err, null);
                    test.ok(result);
                    var sql = "select * from widgets";
                    self.easy.execute(sql, function (err, results) {
                        test.equal(results[0].name, 'foo');
                        test.done();
                    });
                });
            },

            "without params": function (test) {
                var self = this;
                var sql = "insert into widgets(name) values ('bob')";

                self.easy.execute(sql, function (err, result) {
                    check_err(err, test);
                    test.strictEqual(err, null);
                    test.ok(result);
                    var sql = "select * from widgets";
                    self.easy.execute(sql, function (err, results) {
                        test.equal(results[0].name, 'bob');
                        test.done();
                    });
                });
            }
        }),

        "invalid query": testCase({
            "calls callback with error": function (test) {
                var self = this;
                var sql = "BOGUSselect * from widgets where id = ?";
                self.easy.execute(sql, [1], function (err, result) {
                    test.ok(err instanceof Error);
                    test.strictEqual(result, null);
                    test.done();
                });
            }
        })
    }),

    "get_one": testCase({
        setUp: function (callback) {
            var self = this;
            var sql = "insert into widgets(name) values ('bob'), ('jim')";
            self.easy.execute(sql, function (err, result) {
                check_err(err);
                callback();
            });
        },

        "valid queries": testCase({
            "with params": function (test) {
                var self = this;
                var sql = "select * from widgets where name = ?";
                self.easy.get_one(sql, ['bob'], function (err, result) {
                    check_err(err, test);
                    test.strictEqual(err, null);
                    test.equal(result.name, 'bob');
                    test.done();
                });
            },

            "without params": function (test) {
                var self = this;
                var sql = "select name from widgets order by name desc limit 1";
                self.easy.get_one(sql, function (err, result) {
                    check_err(err, test);
                    test.strictEqual(err, null);
                    test.equal(result.name, 'jim');
                    test.done();
                });
            },

            "no results - returns null": function (test) {
                var self = this;
                var sql = "select * from widgets where name = ?";
                self.easy.get_one(sql, ['not real'], function (err, result) {
                    check_err(err, test);
                    test.strictEqual(err, null);
                    test.strictEqual(result, null);
                    test.done();
                });
            }
        }),

        "invalid query": testCase({
            "calls callback with error": function (test) {
                var self = this;
                var sql = "BOGUSselect * from widgets";
                self.easy.get_one(sql, function (err, result) {
                    test.ok(err instanceof Error);
                    test.strictEqual(result, null);
                    test.done();
                });
            }
        })
    }),

    "get_all": testCase({
        setUp: function (callback) {
            var self = this;
            var sql = "insert into widgets(name) values ('bob'), ('jim')";
            self.easy.execute(sql, function (err, result) {
                check_err(err);
                callback();
            });
        },

        "valid queries": testCase({
            "with params": function (test) {
                var self = this;
                var sql = "select * from widgets where name = ?";
                self.easy.get_all(sql, ['bob'], function (err, results) {
                    check_err(err, test);
                    test.strictEqual(err, null);
                    test.ok(Array.isArray(results));
                    test.equal(results[0].name, 'bob');
                    test.done();
                });
            },

            "without params": function (test) {
                var self = this;
                var sql = "select name from widgets order by name desc";
                self.easy.getAll(sql, function (err, results) {
                    check_err(err, test);
                    test.strictEqual(err, null);
                    test.ok(Array.isArray(results));
                    test.equal(results.length, 2);
                    test.equal(results[0].name, 'jim');
                    test.done();
                });
            },

            "no results - returns empty array": function (test) {
                var self = this;
                var sql = "select * from widgets where name = ?";
                self.easy.get_all(sql, ['not real'], function (err, results) {
                    check_err(err, test);
                    test.strictEqual(err, null);
                    test.ok(Array.isArray(results));
                    test.equal(results.length, 0);
                    test.done();
                });
            }
        }),

        "invalid query": testCase({
            "calls callback with error": function (test) {
                var self = this;
                var sql = "BOGUSselect * from widgets";
                self.easy.get_all(sql, function (err, results) {
                    test.ok(err instanceof Error);
                    test.strictEqual(results, null);
                    test.done();
                });
            }
        })
    }),

    "passing in a generic pool object": testCase({
        "execute": testCase({
            "valid queries": testCase({
                "with params": function (test) {
                    var self = this;
                    var pool = easy_pool.create(settings);
                    self.easy = new EasyMySQL({pool: pool});
                    var sql = "insert into widgets(name) values (?)";

                    self.easy.execute(sql, ['foo'], function (err, result) {
                        check_err(err, test);
                        test.strictEqual(err, null);
                        test.ok(result);
                        var sql = "select * from widgets";
                        self.easy.execute(sql, function (err, results) {
                            test.equal(results[0].name, 'foo');
                            test.done();
                        });
                    });
                }
            })
        })
    })
});
