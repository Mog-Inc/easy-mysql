/**
 * @fileOverview simplified MySQL interaction.
 * @author Bryan Donovan
 */

var EasyClient = require('./easy_client');

/**
 * @class
 *
 * @description Note: use EasyMySQL.create() to create EasyMySQL objects.
 * This hides the implementation details and will make future
 * refactorings easier if the underlying implementation changes
 * (e.g., we decide not to use a class).
 *
 * @property {EasyClient} client - The EasyClient object to use.
 * @property {object} settings - The settings object passed into the constructor.
 * @see EasyMySQL.create
 */
function EasyMySQL(settings) {
    if (!(this instanceof EasyMySQL)) {
        return new EasyMySQL(settings);
    }
    var self = this;
    self.client = null;

    self.settings = settings;

    /**
     * @private
     */
    this.fetch_client = function (cb) {
        var self = this;
        EasyClient.fetch(self.settings, function (err, client) {
            if (err) {
                cb(err);
            } else {
                self.client = client;
                cb(null, client);
            }
        });
    };
}

/**
 * Execute arbitrary SQL query.
 *
 * @param {string} sql - The sql query to execute.
 * @param {array} query_params (optional) - The query params to pass in to the query.
 * @param {function} cb - callback function
 * @returns {object} - The result returned by node-mysql.
 *
 * @example
 *    var sql = "insert into users(login) values(?)";
 *    mysql_easy.execute(sql, ['bob'], function(err, result) { });
 */
EasyMySQL.prototype.execute = function (sql, query_params, cb) {
    var self = this;
    if (typeof query_params === 'function') {
        cb = query_params;
        query_params = [];
    }
    self.fetch_client(function (err, easy_client) {
        if (err) {
            cb(err);
            if (easy_client) {
                easy_client.end();
            }
            return;
        } else {
            easy_client.query(sql, query_params, function (err, results) {
                if (err) {
                    cb(err, null);
                    if (easy_client) {
                        easy_client.end();
                    }
                    return;
                } else {
                    cb(null, results);
                    easy_client.end();
                }
            });
        }
    });
};

/**
 * Get a single result from SQL query.
 *
 * Note:
 * Be sure to add a limit statement or a 'where' clause that limits the results to one row.
 * This function only returns one result, but it doesn't add a limit statement for you.
 *
 * @param {string} sql - The sql query to execute.
 * @param {array} query_params (optional) - The query params to pass in to the query.
 * @param {function} cb - callback function
 *
 * @returns {object} - The first result of the query. Returns null if no results found.
 *
 * @example
 *    var sql = "select id, login from users where id = ?";
 *    mysql_easy.get_one(sql, [123], function(err, result) {
 *      console.log(result);
 *    });
 *
 *    >> {id:123, login:"jim@example.com"}
 */
EasyMySQL.prototype.get_one = function (sql, query_params, cb) {
    var self = this;
    if (typeof query_params === 'function') {
        cb = query_params;
        query_params = [];
    }
    self.execute(sql, query_params, function (err, results) {
        if (err) {
            cb(err, null);
        } else if (results.length === 0) {
            cb(null, null);
        } else {
            cb(null, results[0]);
        }
    });
};

/**
 * Get array of results from SQL query.
 *
 * @param {string} sql - The sql query to execute.
 * @param {array} query_params (optional) - The query params to pass in to the query.
 * @param {function} cb - callback function
 *
 * @returns {array} Array of the results of the query.  Returns empty array if no results found.
 *
 * @example
 *    var sql = "select id, login from users limit 2";
 *    mysql_easy.get_all(sql, function(err, result) {
 *      console.log(result);
 *    });
 *
 *    >> [{id:123, login:"jim@example.com"}, {id:456, login:"bob@example.com"}]
 */
EasyMySQL.prototype.get_all = function (sql, query_params, cb) {
    var self = this;
    if (typeof query_params === 'function') {
        cb = query_params;
        query_params = [];
    }
    self.execute(sql, query_params, function (err, results) {
        if (err) {
            cb(err, null);
        } else if (results.length === 0) {
            cb(null, []);
        } else {
            cb(null, results);
        }
    });
};


/**
 * Alias for get_one
 * @see EasyMySQL#get_one
 */
EasyMySQL.prototype.getOne = function (sql, query_params, cb) {
    var self = this;
    return self.get_one(sql, query_params, cb);
};

/**
 * Alias for get_all
 * @see EasyMySQL#get_all
 */
EasyMySQL.prototype.getAll = function (sql, query_params, cb) {
    var self = this;
    return self.get_all(sql, query_params, cb);
};

/**
 * @description EasyMySQL can be used in three modes:
 * <br><pre>
 *  1. Direct: Directly establish a single connection for each query.
 *  This is probably not a good idea for production code, but may be fine for code
 *  where you don't want to set up a pool, such as in unit tests.
 *
 *  2. Custom Pool: Pass in your own pool object.  It must have functions named
 *  'acquire' and 'release'. See example in easy_pool.js.
 *
 *  3. Built-in Pool: Use the built-in node-pool (easy_pool.js).
 * </pre>
 *
 * @see <a href='https://github.com/coopernurse/node-pool'>node-pool</a>.
 * @see easy_pool
 *
 * @param {object} settings - An object of MySQL settings. Settings properties:
 * <br><pre>
 *   user          : (required) - Database user.
 *   database      : (required) - Database to connect to.
 *   password      : (optional) - default: null
 *   host          : (optional) - default: localhost
 *   port          : (optional) - default: 3306
 *   pool          : (optional) - An optional pool to use.
 *                                If a pool is passed in, you do not need to pass in any other
 *                                params, and any other params will be overridden.
 *   use_easy_pool : (optional) - Use the built-in pool, default: false.
 *   pool_size     : (optional) - If use_easy_pool is true, pool_size
 *                                specifies the size of the pool in easy_pool.js.
 * </pre>
 *
 * @returns {EasyMySQL} - returns an EasyMySQL object.
 *
 * @example
 * var settings = {
 *     user     : 'myuser',
 *     password : 'mypass',
 *     database : 'mydb'
 * };
 *
 * var easy_mysql = EasyMySQL.create(settings);
 * easy_mysql.get_one("select * from foo where bar = ?", ['jazz'], function (err, result) {
 *     // do stuff
 * });
 *
 */
EasyMySQL.create = function (settings) {
    return new EasyMySQL(settings);
};

module.exports = EasyMySQL;
