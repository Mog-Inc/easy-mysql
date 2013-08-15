var mysql     = require('mysql');
var easy_pool = require('./easy_pool');

/**
 * @class
 * @property {object} client - A MySQL Client object.
 * @property {object} pool - The connection pool to use (if set).
 */
function EasyClient(client, pool) {
    this.client = client;
    this.pool = pool;
}

/**
 * This just delegates to the client query.
 * @param {string} sql - The sql query to execute.
 * @param {array} query_params (optional) - The query params to pass in to the query.
 * @param {function} cb - callback function
 * @returns {object} - The result returned by node-mysql.
 */
EasyClient.prototype.query = function (sql, query_params, cb) {
    this.client.query(sql, query_params, cb);
};

/**
 * If we're using a pool, release the client.
 * If we're using a client directly, call its end() function
 */
EasyClient.prototype.end = function () {
    if (this.pool) {
        this.pool.release(this.client);
    } else {
        this.client.end();
    }
};

/**
 * @private
 */
function get_client_from_pool(pool, cb) {
    pool.acquire(function (err, client) {
        if (err) {
            cb(err, null);
        } else if (!client) {
            // What should we do here?  Maybe throw the error?
            cb(new Error("Client not acquired"), null);
        } else {
            cb(null, new EasyClient(client, pool));
        }
    });
}

/**
 * Create an instance of EasyClient.
 * @param {object} settings - same settings as EasyMySQL.connect
 * @param {function} cb - callback function
 * @see EasyMySQL.connect
 */
EasyClient.fetch = function (settings, cb) {
    if (settings.pool) {
        get_client_from_pool(settings.pool, cb);
    } else if (settings.use_easy_pool) {
        var pool = easy_pool.fetch(settings);
        get_client_from_pool(pool, cb);
    } else {
        var client;
        if (mysql.hasOwnProperty('createConnection')) {
            client = mysql.createConnection(settings);
        } else if (mysql.hasOwnProperty('createClient')) {
            client = mysql.createClient(settings);
        } else {
            console.log("\nEasyMySQL [WARNING]: node-mysql 0.9.1 support is deprecated.\n");
            client = new mysql.Client(settings);
            client.connect();
        }
        cb(null, new EasyClient(client));
    }
};

exports.fetch = EasyClient.fetch;
