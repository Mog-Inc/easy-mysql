if (process.env.JSCOV) {
    module.exports = require("./lib-cov/easy_mysql");
} else {
    module.exports = require("./lib/easy_mysql");
}
