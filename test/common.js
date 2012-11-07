var path = require('path');
var mysql = require('mysql');
var assert = require('assert');

var lib_dir = 'lib';
if (process.env.EASY_MYSQL_JSCOV) {
    lib_dir = 'lib-cov';
}

var EasyMySQL = require('../' + lib_dir + '/easy_mysql');
var EasyClient = require('../' + lib_dir + '/easy_client');
var easy_pool = require('../' + lib_dir + '/easy_pool');

var conn_method = 'createConnection';
if (mysql.hasOwnProperty('createClient')) {
    conn_method = 'createClient';
}

function clone(object) {
    var ret = {};
    Object.keys(object).forEach(function (val) {
        ret[val] = object[val];
    });
    return ret;
}

function random_string(str_len) {
    return 'str' + Math.floor(Math.random() * 10000000000);
}

try {
    var settings = require('./settings');
} catch (e) {
    console.log('Skipping. See test/settings.example.js for more information.');
    process.exit(0);
}

var db = settings.db1.database;

var table_sql = "create table widgets( " +
                "id int auto_increment primary key, " +
                "name varchar(25)) ";

function setup_db(cb) {
    var _settings = clone(settings.db1);
    delete _settings.database;
    var client;
    try {
        client = mysql[conn_method](_settings);
    } catch (e) {
        client = new mysql.Client(_settings);
        client.connect();
    }

    client.query('CREATE DATABASE ' + db, function (err) {
        if (!(err && (err.number == mysql.ERROR_DB_CREATE_EXISTS || err.number == 1007))) {
            throw err;
        }
    });
    client.query('USE ' + db);
    client.query('drop table if exists widgets');
    client.query(table_sql, function (err) {
        client.end();
        assert.ifError(err);
        cb(null, true);
    });
}

function setup_db2(cb) {
    var _settings = clone(settings.db2);
    delete _settings.database;
    var client;
    try {
        client = mysql[conn_method](_settings);
    } catch (e) {
        client = new mysql.Client(_settings);
        client.connect();
    }

    client.query('CREATE DATABASE ' + settings.db2.database, function (err) {
        client.end();
        if (!(err && (err.number == mysql.ERROR_DB_CREATE_EXISTS || err.number == 1007))) {
            throw err;
        }
        cb(null);
    });
}

exports.setup_db      = setup_db;
exports.setup_db2     = setup_db2;
exports.database      = 'easy_mysql_test';
exports.settings      = settings;
exports.clone         = clone;
exports.random_string = random_string;
exports.EasyMySQL     = EasyMySQL;
exports.EasyClient    = EasyClient;
exports.easy_pool     = easy_pool;
