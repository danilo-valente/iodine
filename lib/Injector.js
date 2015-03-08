var _ = require('lodash');

var Injector = function (valueDelimiter) {
    if (!valueDelimiter) {
        throw new Error('Invalid value delimiter');
    }
    
    this.beans = {};
    this.instances = {};
    this.values = {};
    this.valueDelimiter = valueDelimiter;
};

Injector.prototype.setValue = function (path, val) {
    if (!path || !_.isString(path)) {
        this.values = val;
        return;
    }

    var parts = path.split('.');
    var lastKey = parts.pop();
    var obj = _.reduce(parts, function (obj, key) {
        if (!obj.hasOwnProperty(key)) {
            obj[key] = {};
        }
        return obj[key];
    }, this.values);

    obj[lastKey] = val;
    return obj;
};

Injector.prototype.getValue = function (path) {
    if (!path || !_.isString(path)) {
        return this.values;
    }

    var parts = path.split('.');
    return _.reduce(parts, function (obj, key) {
        if (!obj.hasOwnProperty(key)) {
            throw new Error('Could not find value "' + path + '"');
        }
        return obj[key];
    }, this.values);
};

Injector.prototype._isValue = function (name) {
    return name.indexOf(this.valueDelimiter) === 0;
};

Injector.prototype._parseName = function (name) {
    var trimmed = name.trim();

    if (!trimmed) {
        throw new Error('Invalid bean name "' + name + '". Cannot be empty');
    }

    if (this._isValue(trimmed)) {
        throw new Error('Invalid bean name "' + name + '". Cannot start with ' + this.valueDelimiter);
    }

    return trimmed;
};

Injector.prototype.get = function (beanName) {
    var name = this._parseName(beanName);
    var bean = this.beans[name];
    if (!bean) {
        throw new Error('No such bean "' + beanName + '" (parsed as "' + name + '")');
    }

    return bean;
};

Injector.prototype.bean = function (bean) {
    var name = this._parseName(bean.name);
    if (this.beans[name]) {
        throw new Error('Bean "' + bean.name + '" (parsed as "' + name + '") is already defined');
    }

    bean.name = name;
    this.beans[name] = bean;
};

Injector.prototype.inject = function (bean) {

    var args = _.map(bean.inject, function (dep) {
        if (this._isValue(dep)) {
            var path = dep.substr(this.valueDelimiter.length);
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
    var name = this._parseName(bean.name);
    if (!this.instances.hasOwnProperty(name)) {
        this.instances[name] = this.inject(bean)();
    }

    return this.instances[name];
};

module.exports = Injector;

function bind(fn, thisArg, args) {
    return Function.prototype.bind.apply(fn, [thisArg].concat(args));
}