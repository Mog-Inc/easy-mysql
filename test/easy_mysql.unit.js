var testCase  = require('nodeunit').testCase;
var common    = require('./common');
var settings  = common.settings;
var EasyMySQL = require('../lib/easy_mysql');
var mysql     = require('mysql');
var clone     = require('./clone');

var db = settings.database;

function get_settings() {
    return settings;
}

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
            self.easy = new EasyMySQL(settings);
            callback();
        });
    },

    "connecting": function (test) {
        var easy = new EasyMySQL(settings);
        easy._connect(function (err, client) {
            check_err(err, test);
            test.equal(client.user, settings.user);
            test.equal(client.password, settings.password);
            test.equal(client.port, settings.port);
            test.equal(client.database, settings.database);
            test.done();
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

    "find_one": testCase({
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
                self.easy.find_one(sql, ['bob'], function (err, result) {
                    check_err(err, test);
                    test.strictEqual(err, null);
                    test.equal(result.name, 'bob');
                    test.done();
                });
            },

            "without params": function (test) {
                var self = this;
                var sql = "select name from widgets order by name desc limit 1";
                self.easy.find_one(sql, function (err, result) {
                    check_err(err, test);
                    test.strictEqual(err, null);
                    test.equal(result.name, 'jim');
                    test.done();
                });
            },

            "no results - returns null": function (test) {
                var self = this;
                var sql = "select * from widgets where name = ?";
                self.easy.find_one(sql, ['not real'], function (err, result) {
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
                self.easy.find_one(sql, function (err, result) {
                    test.ok(err instanceof Error);
                    test.strictEqual(result, null);
                    test.done();
                });
            }
        })
    }),

    "find_all": testCase({
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
                self.easy.find_all(sql, ['bob'], function (err, results) {
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
                self.easy.find_all(sql, function (err, results) {
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
                self.easy.find_all(sql, ['not real'], function (err, results) {
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
                self.easy.find_all(sql, function (err, results) {
                    test.ok(err instanceof Error);
                    test.strictEqual(results, null);
                    test.done();
                });
            }
        })
    })
});
