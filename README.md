Iodine
=====
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]

**Iodine** is a JavaScript framework built to help Node.js developers write modular applications by providing a Dependency Injector engine.

## Installation

Install iodine with npm by running:

```sh
npm install iodine
```

## Basic Usage

```js
var iodine = require('iodine');

var app = iodine();

if (process.env.PRODUCTION) {
	app.value('db.hostname', 'mydomain');
	app.value('db.port', '5678');
	app.value('db.name', 'users');
} else {
	app.value('db.hostname', 'localhost');
	app.value('db.port', '1234');
	app.value('db.name', 'test');
}

app.bean('db', ['#db.hostname', '#db.port', '#db.name', function (dbHostname, dbPort, dbName) {
	return new Connection(dbHostname, dbPort, dbName);
});

app.run(function (db) {
	db.save({
		name: 'John Doe',
		age: 20
	});
});
```

## Concepts

### App

An App is the object responsible for holding values, beans and their respective instances. You can have more than only one App in your code.
Example:
```js
var app1 = iodine();
var app2 = iodine({
	// Some custom configuration
});
```

### Bean

A Bean is the responsible to represent an object that is accessible through your App instance. It can be either run or injected into another bean's implementation.
It's holds information such as name, implementation, dependencies, initialization type (factory/constructor) and caching mode (singleton/transient).

### Implementation

Implementation is the term used to describe the function (factory/constructor) responsible for the bean initialization.
It can also take as arguments a set of other beans' instances.

#### Implicit Dependency Annotations

In order the define which beans should be injected into your new bean's implementation, you can use what is called Implicit Dependency Annotations (inspired by the Angular.js framework).
This way, you don't need to explicitly list your dependencies, just define a bean and give it some arguments.
Example:
```js
app.bean('myBean', function (dep1, dep2) {
	// ...
});
```

Iodine will parse your function and will find out that it depends on dep1 and dep2 and, if they exist, they will be injected.

**Note:** You should only implicitly define your dependencies if your code is not going to be minified, since minifying process is based on renaming all variables into shorter names and dependency names are parsed from the actual arguments names.
This is what would happen if you minify your code:
```js
// Will try to inject 'a' and 'b', but will fail
app.bean('myBean',function(a,b){/* ... */});
```

#### Inline Notation

The inline notation allows beans implementations to be defined using an array, where the all items are strings that represent the name of beans that should be injected into current bean's implementation, which corresponds to the last item of this array.
Example:
```js
app.bean('myBean1', ['dep1', 'dep2', function (dep1, dep2) {
	// ...
}]);

// Will infer the bean name from the implementation function's name
app.bean(['dep1', 'dep2', function myBean2(dep1, dep2) {
	// ...
}]);
```

#### Object Notation

By using the object notation, you are able to pass a BeanConfig object to a `.bean()` method call.
Example:
```js
app.bean('myBean1', function () {
	this.method = function (dep1, dep2) {};
}, {
	inject: ['dep1', 'dep2'],
	singleton: true,
});

app.bean(function myBean2() {
	this.method = function (dep1, dep2) {};
}, {
	inject: ['dep1', 'dep2'],
	singleton: true,
});
```

#### Function Notation

You can also define bean's configuration directly into it's implementation function by defining `.__inject`, `.__singleton` and `__.factory` properties.
Example:
```js
var numberFactory = function (random) {
	return random(0, 100);
};
numberFactory.__inject = ['random'];
numberFactory.__singleton = false;
numberFactory.__factory = true;

app.bean('number', numberFactory);
```

### Factory vs Constructor

#### Factory

A [factory](http://en.wikipedia.org/wiki/Factory_%28object-oriented_programming%29) implementation is a bean implementation that is called as a normal function and is expected to return any value.
Example
```js
app.bean('myFactory', function () {
	return {
		property: 'value',
		method: function () {}
	};
});
```

#### Constructor

A [constructor](http://en.wikipedia.org/wiki/Constructor_%28object-oriented_programming%29) implementation is a bean implementation that is called with `new` keyword, and thus it shouldn't return any value. Instead, it should initialize the new object's methods/attributes.
Example:
```js
app.bean('myConstructor', function () {
	this.property = 'value';
	this.method = function () {};
});
```

### Singleton vs Transient

#### Singleton

A singleton is a bean that is initialized only once, and then its reference is cached for further uses.
Example:
```js
var count = 0;
app.bean('myBean', function () {
	// This function will be called only once the return value will be cached
	return ++count;
}, { singleton: true });

app.run(function (myBean) {
	console.log(myBean); // 1
});

app.run(function (myBean) {
	console.log(myBean); // 1
});
```

#### Transient

A transient is a bean that is initialized everytime it's injected into another bean.
Example:
```js
var count = 0;
app.bean('myBean', function () {
	// This function will be called anytime this bean is injected
	return ++count;
}, { singleton: false });

app.run(function (myBean) {
	console.log(myBean); // 1
});

app.run(function (myBean) {
	console.log(myBean); // 2
});
```

## API

### iodine(config: AppConfig): App

Return an instance of `App` with the given configuration.

### iodine.version: SemVer

Iodine's version holder. Corresponds to version defined in the *package.json* file, according to the [semantic versioning specification](http://semver.org/).

### AppConfig

A plain object containing the App's configuration.
Example:
```js
{
	valueDelimiter: '#',
	logger: function (type, message) {
		switch (type) {
			case 'warning':
				console.warn(message);
				break;
			default:
				console.log(message);
		}
	}
}
```

#### AppConfig#valueDelimiter: String (default = `'#'`)

The delimiter to be used to identify values being injected.

#### AppConfig#logger: Function(type: String, message: String) (default = `null`)

The logger function that will be eventually called by Iodine to log information.

### App

Object that represents an Iodine application. It's responsible for holding all beans, instances and values.

#### App#bean(...): App

Register a new bean to the application.

##### App#bean(impl: Function): App

Register a new bean with name `impl.name` and implementation `impl`. Also, will try to infer all dependencies based on `impl.toString()` output.

##### App#bean(name: String, impl: Function): App

Register a new bean with name `name` and implementation `impl`. Also, will try to infer all dependencies based on `impl.toString()` output.

##### App#bean(def: Inline): App

Register a new bean with the last item of `def` as the bean's implementation, `.name` property of implementation function as the bean's name and the rest of items as dependencies names.

##### App#bean(name: String, def: Inline): App

Register a new bean with name `name`, the last item of `def` as the bean's implementation and the rest of items as dependencies names.

##### App#bean(impl: Function, config: BeanConfig): App

Register a new bean with name `impl.name` and implementation `impl`. Also, will use configuration defined in `config`.

##### App#bean(def: Inline, config: BeanConfig): App

Register a new bean with the last item of `def` as the bean's implementation, `.name` property of implementation function as the bean's name and the rest of items as dependencies names. Also, will use configuration defined in `config`.

##### App#bean(name: string, def: Inline, config: BeanConfig): App

Register a new bean with the last item of `def` as the bean's implementation, `name` as the bean's name and the rest of items as dependencies names. Also, will use configuration defined in `config`.

##### App#bean(name: String, impl: Function, config: BeanConfig): App

Register a new bean with name `name` and implementation `impl`. Also, will use configuration defined in `config`.

#### App#value(...): void/PlainObject/any

Register/restore a value from the application's values map.

##### App#value(map: PlainObject): void

Replace the whole values map with `map`.
Example:
```js
app.value({ foo: 'bar' });
```

##### App#value(namespace: String, value: *): void

Register a new value `value` into `namespace`. Uses `'.'` as namespace delimiter.
Example:
```js
app.value('foo.bar', true);
```

##### App#value(): PlainObject

Restore the whole values map.
Example:
```js
app.value('foo.bar', true);
app.value();	// { foo: { bar: true } }
```

##### App#value(namespace: String): *

Restore the value stored in `namespace`.
Example:
```js
app.value('foo.bar', true);
app.value('foo.bar');	// true
```

#### App#inject(...): Function

Return a wrapper function for the bean with all dependencies injected.

##### App#inject(name: String): Function

Find the bean with name `name`and inject its dependencies.

##### App#inject(impl: Function): Function

Create a new bean based on `impl`and inject its dependencies. Also, will try to infer all dependencies based on `impl.toString()` output.

##### App#inject(def: Inline): Function

Create a new bean based on `def` and inject its dependencies.

##### App#inject(def: Inline, config: BeanConfig): Function

Create a new bean based on `def` and inject its dependencies. Will use configuration defined in `config`.

##### App#inject(impl: Function, config: BeanConfig): Function

Create a new bean based on `impl` and inject its dependencies. Will use configuration defined in `config`.

#### App#run(...): any

Inject all dependencies and initialize the bean by calling it's implementation.
Return the result returned from the implementation function.

##### App#run(name: String): any

Find the bean with name `name`and initialize it.

##### App#run(impl: Function): any

Create a new bean based on `impl`and initialize it. Also, will try to infer all dependencies based on `impl.toString()` output.

##### App#run(def: Inline): any

Create a new bean based on `def` and initialize it.

##### App#run(def: Inline, config: BeanConfig): any

Create a new bean based on `def` and initialize it. Will use configuration defined in `config`.

##### App#run(impl: Function, config: BeanConfig): any

Create a new bean based on `impl` and initialize it. Will use configuration defined in `config`.

#### App#import(...): App

Try to register the first argument as a new bean. Useful to register beans defined in other files.

##### App#import(filename: String): App

Require `filename` and pass returned value to #import.
Example:
```js
// lib.js
module.exports = {
	alpha: function alpha(dep1, dep2) {},
	beta: ['dep1', 'dep2', function beta(dep1, dep2) {}]
};

// index.js
app.import('lib.js');
```

##### App#import(map: PlainObject): App

Iterate over each key/value tuple of `map` and try to register a new bean with based on tuple's value. Note that this value can be either a `Function` or an `Inline` notation.
Example:
```js
// lib.js
module.exports = {
	alpha: function alpha(dep1, dep2) {},
	beta: ['dep1', 'dep2', function beta(dep1, dep2) {}]
};

// index.js
app.import(require('./lib.js'));
```

##### App#import(map: PlainObject, keyAsName: Boolean): App

Similar to the overload described above, expect for the fact that, in case `keyAsName` is truthy, each bean will be registered and their name will correspond to the key of each key/value tuple.

##### App#import(impl: Function): App

Will try to register a new bean based on `impl`.
Example:
```js
// lib.js
module.exports = function myBean(dep1, dep2) {};

// index.js
app.import(require('./lib.js'));
```

##### App#import(impl: Function): App

Will try to register a new bean based on `impl`.
Example:
```js
// lib.js
module.exports = ['dep1', 'dep2', function myBean(dep1, dep2) {}];

// index.js
app.import(require('./lib.js'));
```

#### App#require(filename: String): Any

Require `filename` and pass returned value to #run.


### BeanConfig

A plain object containing the Bean's configuration.
Example:
```js
{
	inject: ['dep1', 'dep2'],
	singleton: true,
	factory: true
}
```

#### BeanConfig#inject: Array (default= `[]`)

Array containing the names of the beans which the current bean depends on.
Example:
```js
// lib.js
module.exports = function (dep1, dep2) {};

// index.js
app.require('lib.js');
```

#### BeanConfig#singleton: Boolean (default = `true`)

Define whether the bean should be treated as a singleton or not.

#### BeanConfig#factory: Boolean (default = `true`)

Define whether the bean should be initialized from either a factory or a constructor.

### Inline

A mixed-type array where the items are all strings that contain the names of the beans which the current bean depends on, except for the last item, which is actually a function that represents the bean's implementation.

Example:
```js
['dep1', 'dep2', function (dep1, dep2) {
	// ...
}]
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/iodine
[npm-image]: https://badge.fury.io/js/iodine.png

[travis-url]: https://travis-ci.org/danilo-valente/iodine
[travis-image]: https://travis-ci.org/danilo-valente/iodine.svg?branch=master