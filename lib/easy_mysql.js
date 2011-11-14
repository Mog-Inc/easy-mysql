var EasyClient = require('./easy_client');

/**
 * @class
 *
 * @description Note: use connect(), connect_with_easy_pool(),
 * and connect_with_pool() to create EasyMySQL objects.
 * This hides the implementation details and will make future
 * refactorings easier if the underlying implementation changes
 * (e.g., we decide not to use a class).
 *
 * @property {EasyClient} client - The EasyClient object to use.
 * @property {object} settings - The settings object passed into the constructor.
 * @see EasyMySQL.connect
 * @see EasyMySQL.connect_with_easy_pool
 * @see EasyMySQL.connect_with_pool
 */
function EasyMySQL(settings) {
    if (!(this instanceof EasyMySQL)) {
        return new EasyMySQL(settings);
    }
    var self      = this;
    self.client   = null;
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
 * Directly establish a single connection for each query.
 * This is probably not a good idea for production code, but may be fine for code
 * where you don't want to set up a pool, such as in unit tests.
 *
 * @param {object} settings - An object of MySQL settings. Settings properties:
 * <br><pre>
 *   user          : (required) - Database user.
 *   database      : (required) - Database to connect to.
 *   password      : (optional) - default: null
 *   host          : (optional) - default: localhost
 *   port          : (optional) - default: 3306
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
 */
EasyMySQL.connect = function (settings) {
    return new EasyMySQL(settings);
};

/**
 * Use built-in easy_pool.js, which uses generic-pool.
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
 *   pool_size     : (optional) - The size of the pool in easy_pool.js. Default: 10
 * </pre>
 *
 * @returns {EasyMySQL} - returns an EasyMySQL object.
 *
 * @example
 * var settings = {
 *     user      : 'myuser',
 *     password  : 'mypass',
 *     database  : 'mydb',
 *     pool_size : 50
 * };
 *
 * var easy_mysql = EasyMySQL.create_with_easy_pool(settings);
 */
EasyMySQL.connect_with_easy_pool = function (settings) {
    settings.use_easy_pool = true;
    return new EasyMySQL(settings);
};

/**
 * Use a custom pool:
 *
 * @see easy_pool
 *
 * @param {object} pool - A connection pool. It must have functions named 'acquire' and 'release'.
 * See example in easy_pool.js.
 *
 * @returns {EasyMySQL} - returns an EasyMySQL object.
 *
 * @example
 * var my_pool = //.. create your own pool however you want.
 *
 * var easy_mysql = EasyMySQL.create(pool);
 */
EasyMySQL.connect_with_pool = function (pool) {
    return new EasyMySQL({pool: pool});
};

exports.connect                = EasyMySQL.connect;
exports.connect_with_easy_pool = EasyMySQL.connect_with_easy_pool;
exports.connect_with_pool      = EasyMySQL.connect_with_pool;
