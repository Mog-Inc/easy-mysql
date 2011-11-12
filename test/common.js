var path = require('path');
require.paths.unshift(path.dirname(__dirname) + '/lib');
var mysql = require('mysql');

function clone(object) {
    var ret = {};
    Object.keys(object).forEach(function (val) {
        ret[val] = object[val];
    });
    return ret;
}

function check_err(err, test) {
    if (err) {
        if (test) {
            test.ok(false);
        }
        throw new Error(err);
    }
}

try {
    var settings = require('./settings');
} catch (e) {
    console.log('Skipping. See test/settings.template.js for more information.');
    process.exit(0);
}

var db = settings.database;

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

exports.check_err = check_err;
exports.setup_db  = setup_db;
exports.database  = 'easy_mysql_test';
exports.settings  = settings;
exports.clone     = clone;
