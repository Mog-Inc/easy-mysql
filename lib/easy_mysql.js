var MySQL = require('mysql');

function EasyMySQL(settings) {
    if (!(this instanceof EasyMySQL)) {
        return new EasyMySQL(settings);
    }
    var self = this;

    self.settings = settings;

    this.get_client = function (cb) {
        var self = this;
        if (self.client) {
            cb(null, self.client);
        } else {
            var client = MySQL.createClient(self.settings);
            self.client = client;
            cb(null, self.client);
        }
    };
}

EasyMySQL.prototype._connect = function (cb) {
    var self = this;
    self.get_client(function (err, client) {
        cb(err, client);
    });
};

EasyMySQL.prototype.execute = function (sql, query_params, cb) {
    var self = this;
    if (typeof query_params === 'function') {
        cb = query_params;
        query_params = [];
    }
    self.get_client(function (err, db_client) {
        if (err) {
            cb(err);
            if (db_client) {
                db_client.end();
            }
            return;
        } else {
            db_client.query(sql, query_params, function (err, results) {
                if (err) {
                    cb(err, null);
                    if (db_client) {
                        db_client.end();
                    }
                    return;
                } else {
                    cb(null, results);
                    db_client.end();
                }
            });
        }
    });
};

EasyMySQL.prototype.find_one = function (sql, query_params, cb) {
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

EasyMySQL.prototype.find_all = function (sql, query_params, cb) {
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

EasyMySQL.prototype.get_one = function(sql, query_params, cb) {
    var self = this;
    return self.find_one(sql, query_params, cb);
};

EasyMySQL.prototype.findOne = function(sql, query_params, cb) {
    var self = this;
    return self.find_one(sql, query_params, cb);
};

EasyMySQL.prototype.get_all = function(sql, query_params, cb) {
    var self = this;
    return self.find_all(sql, query_params, cb);
};

EasyMySQL.prototype.findAll = function(sql, query_params, cb) {
    var self = this;
    return self.find_all(sql, query_params, cb);
};


module.exports = EasyMySQL;
