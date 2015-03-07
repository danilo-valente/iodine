var _ = require('lodash');

var Injector = function (valueDelimiter) {
    this.beans = {};
    this.instances = {};
    this.values = {};
    this.valueDelimiter = valueDelimiter;
};

Injector.prototype._value = function (path, val) {
    if (!_.isString(path) || !path) {
        return this.values;
    }

    var parent = null;
    var obj = this.values;
    var parts = path.split('.');
    var key;
    while (parts.length > 0) {
        key = parts.shift();
        if (_.isNull(obj[key]) || _.isUndefined(obj[key])) {
            obj[key] = {};
        }
        parent = obj;
        obj = obj[key];
    }

    if (parent && arguments.length > 1) {
        parent[key] = val;
        return val;
    }

    return obj;
};

Injector.prototype.setValue = function (path, val) {
    if (_.isString(path)) {
        this._value(path, val);
    } else {
        this.values = _.extend({}, val);
    }
};

Injector.prototype.getValue = function (path) {
    return this._value(path);
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
        return this.getInstance(depBean);
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
    if (bean.singleton && this.instances[bean.name]) {
        throw new Error('"' + bean.name + '" is a singleton and has already been initialized');
    }

    return this.inject(bean)();
};

Injector.prototype.cache = function (bean) {
    if (!bean.singleton) {
        throw new Error('Cannot cache a singleton bean ("' + bean.name + '")');
    }

    var instance = this.instances[bean.name];
    if (!instance) {
        instance = this.init(bean);
        this.instances[bean.name] = instance;
    }

    return instance;
};

Injector.prototype.getInstance = function (bean) {
    return bean.singleton ? this.cache(bean) : this.init(bean);
};

module.exports = Injector;

function bind(fn, thisArg, args) {
    return Function.prototype.bind.apply(fn, [thisArg].concat(args));
}