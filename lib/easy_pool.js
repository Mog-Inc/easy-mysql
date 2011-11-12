var pool_module = require('generic-pool');
var path        = require('path');

/** @namespace */
var easy_pool = {
    /**
     * @param {object} settings - A settings object. See
     * Settings properties:
     * <br><pre>
     *   user         : (required) - MySQL database user.
     *   database     : (required) - MySQL database to connect to.
     *   password     : (optional) - default: null
     *   host         : (optional) - default: localhost
     *   port         : (optional) - default: 3306
     *   pool_size    : (optional) - default: 10
     *   idle_timeout : (optional) - Timeout in milliseconds. default: 10
     *   log          : (optional) - If true, log to console. If a function is passed in,
     *                               use that function for logging.
     *                               default: false.
     * </pre>
     * @see <a href='https://github.com/coopernurse/node-pool'>node-pool</a>.
     */
    create: function (settings) {
        return pool_module.Pool({
            name : 'mysql_' + settings.database,

            create : function (callback) {
                var mysql = require('mysql');
                var client = mysql.createClient(settings);
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

module.exports = easy_pool;
