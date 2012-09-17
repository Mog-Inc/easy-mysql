var pool_module = require('generic-pool');
var mysql       = require('mysql');

var conn_method = 'createConnection';
if (mysql.hasOwnProperty('createClient')) {
    conn_method = 'createClient';
}

/** @ignore */
var pool = {
    /** @ignore */
    create: function (settings) {
        return pool_module.Pool({
            name : 'mysql_' + settings.database,

            create : function (callback) {
                var client;
                if (mysql.hasOwnProperty(conn_method)) {
                    client = mysql[conn_method](settings);
                } else {
                    console.log("\nEasyMySQL [WARNING]: node-mysql 0.9.1 support is deprecated.\n");
                    client = new mysql.Client(settings);
                    client.connect();
                }
                callback(null, client);
            },

            destroy : function (client) {
                client.end();
            },

            max : settings.pool_size || 10,

            idleTimeoutMillis : settings.idle_timeout || 5000,

            log : settings.log || false

        });
    }
};

/** @namespace */
var easy_pool = (function () {
    var pool_cache = {};

    /**
     * @function
     * @param {object} settings - A settings object.
     * Settings properties:
     * <br><pre>
     *   user         : (required) - MySQL database user.
     *   database     : (required) - MySQL database to connect to.
     *   password     : (optional) - default: null
     *   host         : (optional) - default: localhost
     *   port         : (optional) - default: 3306
     *   pool_size    : (optional) - default: 10
     *   idle_timeout : (optional) - Timeout in milliseconds. default: 5000
     *   log          : (optional) - If true, log to console. If a function is passed in,
     *                               use that function for logging.
     *                               default: false.
     * </pre>
     *
     * @returns {object} a node-pool (generic-pool) Pool object.
     * @see <a href='https://github.com/coopernurse/node-pool'>node-pool</a>.
     */
    function fetch(settings) {
        var cache_key = JSON.stringify(settings);
        if (!pool_cache[cache_key]) {
            pool_cache[cache_key] = pool.create(settings);
        }
        return pool_cache[cache_key];
    }

    return {
        fetch: fetch
    };
}());

module.exports = easy_pool;
