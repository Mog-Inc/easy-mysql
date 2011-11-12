var mysql     = require('mysql');
var easy_pool = require('./easy_pool');

/**
 * @class
 * @property {object} client - A MySQL Client object.
 * @property {object} pool - The connection pool to use (if set).
 */
function EasyClient(client, pool) {
    var self    = this;
    self.client = client;
    self.pool   = pool;
}

/**
 * This just delegates to the client query.
 * @param {string} sql - The sql query to execute.
 * @param {array} query_params (optional) - The query params to pass in to the query.
 * @param {function} cb - callback function
 * @returns {object} - The result returned by node-mysql.
 */
EasyClient.prototype.query = function (sql, query_params, cb) {
    var self = this;
    return self.client.query(sql, query_params, cb);
};

/**
 * If we're using a pool, release the client.
 * If we're using a client directly, call its end() function
 */
EasyClient.prototype.end = function () {
    var self = this;
    if (self.pool) {
        self.pool.release(self.client);
    } else {
        self.client.end();
    }
};

/**
 * Create an instance of EasyClient.
 * @param {object} settings - same settings as EasyMySQL.create
 * @param {function} cb - callback function
 * @see EasyMySQL.create
 */
EasyClient.create = function (settings, cb) {
    var easy_client;
    if (settings.pool) {
        settings.pool.acquire(function (err, client) {
            if (err) {
                return cb(err);
            } else {
                easy_client = new EasyClient(client, settings.pool);
                cb(null, easy_client);
            }
        });
    } else if (settings.use_easy_pool) {
        settings.max_connections = settings.pool_size;
        var pool = easy_pool.create(settings);
        pool.acquire(function (err, client) {
            easy_client = new EasyClient(client, pool);
            cb(null, easy_client);
        });
    } else {
        var client = mysql.createClient(settings);
        easy_client = new EasyClient(client);
        cb(null, easy_client);
    }
};

module.exports = EasyClient;
