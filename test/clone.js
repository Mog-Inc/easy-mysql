function clone(object) {
    var ret = {};
    Object.keys(object).forEach(function (val) {
        ret[val] = object[val];
    });
    return ret;
}

module.exports = clone;
