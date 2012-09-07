if (process.env.EASY_MYSQL_JSCOV) {
    module.exports = require("./lib-cov/easy_mysql");
} else {
    module.exports = require("./lib/easy_mysql");
}
