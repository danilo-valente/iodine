var assert = require('assert');
var _ = require('lodash');

var Injector = function (valueDelimiter) {
    assert(valueDelimiter, 'Invalid value delimiter');

    this._beans = {};
    this._instances = {};
    this._values = {};
    this._valueDelimiter = valueDelimiter;
};

Injector.prototype.setValue = function (path, val) {
    if (!path || !_.isString(path)) {
        this._values = val;
        return;
    }

    var parts = path.split('.');
    var lastKey = parts.pop();
    var obj = _.reduce(parts, function (obj, key) {
        if (!obj.hasOwnProperty(key)) {
            obj[key] = {};
        }
        return obj[key];
    }, this._values);

    obj[lastKey] = val;
    return obj;
};

Injector.prototype.getValue = function (path) {
    if (!path || !_.isString(path)) {
        return this._values;
    }

    var parts = path.split('.');
    return _.reduce(parts, function (obj, key) {
        assert(obj.hasOwnProperty(key), 'Could not find value "' + path + '"');
        return obj[key];
    }, this._values);
};

Injector.prototype._isValue = function (name) {
    return name.indexOf(this._valueDelimiter) === 0;
};

Injector.prototype._parseName = function (name) {
    var trimmed = name.trim();

    assert(trimmed, 'Invalid bean name "' + name + '". Cannot be empty');
    assert(!this._isValue(trimmed), 'Invalid bean name "' + name + '". Cannot start with ' + this._valueDelimiter);

    return trimmed;
};

Injector.prototype.get = function (beanName) {
    var name = this._parseName(beanName);
    var bean = this._beans[name];
    assert(bean, 'No such bean "' + beanName + '" (parsed as "' + name + '")');
    return bean;
};

Injector.prototype.bean = function (bean) {
    var name = this._parseName(bean.name);
    assert(!this._beans[name], 'Bean "' + bean.name + '" (parsed as "' + name + '") is already defined');

    bean.name = name;
    this._beans[name] = bean;
};

Injector.prototype.inject = function (bean) {

    var args = _.map(bean.inject, function (dep) {
        if (this._isValue(dep)) {
            var path = dep.substr(this._valueDelimiter.length);
            return this.getValue(path);
        }

        var depBean = this.get(dep);
        return this.init(depBean);
    }, this);

    return bean.factory
        ? bind(bean.fn, null, args)
        : function () {
            var obj = Object.create(bean.fn.prototype);
            bean.fn.apply(obj, args);
            return obj;
        };
};

Injector.prototype.init = function (bean) {
    if (!bean.singleton) {
        return this.inject(bean)();
    }

    var name = this._parseName(bean.name);
    if (!this._instances.hasOwnProperty(name)) {
        this._instances[name] = this.inject(bean)();
    }

    return this._instances[name];
};

module.exports = Injector;

function bind(fn, thisArg, args) {
    return Function.prototype.bind.apply(fn, [thisArg].concat(args));
}