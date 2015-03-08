var expect = require('expect.js');
var Injector = require('../../../lib/Injector.js');
var Bean = require('../../../lib/Bean.js');

describe('lib/Injector', function () {

    var getInjector = function () {
        return new Injector('#');
    };

    describe('#setValue', function () {

        it('should set "foo" to "bar"', function () {
            var injector = getInjector();
            injector.setValue('foo', 'bar');

            expect(injector._values).to.eql({
                foo: 'bar'
            });
        });

        it('should set "foo.bar" to "foobar"', function () {
            var injector = getInjector();
            injector.setValue('foo.bar', 'foobar');

            expect(injector._values).to.eql({ foo: { bar: 'foobar' } });
        });

        it('should reset all values', function () {
            var injector = getInjector();

            injector.setValue('foo.bar', 'foobar');
            expect(injector._values).to.eql({ foo: { bar: 'foobar' } });

            injector.setValue(null, { quux: true });
            expect(injector._values).to.eql({ quux: true });
        });

        it('should replace an object with another object', function () {
            var injector = getInjector();

            injector.setValue('foo.bar', 'foobar');
            expect(injector._values).to.eql({ foo: { bar: 'foobar' } });

            injector.setValue('foo', { quux: true });
            expect(injector._values).to.eql({ foo: { quux: true } });
        });
    });

    describe('#getValue', function () {

        it('should get "foo"', function () {
            var injector = getInjector();
            injector._values = { foo: 'bar' };

            expect(injector.getValue('foo')).to.eql('bar');
        });

        it('should get "foo.bar"', function () {
            var injector = getInjector();
            injector._values = { foo: { bar: 'foobar' } };

            expect(injector.getValue('foo.bar')).to.eql('foobar');
        });

        it('should get the whole "values" object', function () {
            var injector = getInjector();
            injector._values = { foo: { bar: 'foobar' } };

            expect(injector.getValue()).to.eql({ foo: { bar: 'foobar' } });
        });

        it('should fail if value is not defined', function () {
            var injector = getInjector();

            expect(injector.getValue.bind(injector, 'foo')).to.throwError(/Could not find value/);
            expect(injector.getValue.bind(injector, 'foo.bar')).to.throwError(/Could not find value/);
        });
    });

    describe('#bean', function () {

        it('should register a new bean', function () {
            var injector = getInjector();
            var bean = new Bean('myBean', function () {});
            injector.bean(bean);

            expect(injector._beans['myBean']).to.be.a(Bean);
        });

        it('should register a new bean and trim it\'s name', function () {
            var injector = getInjector();
            var bean = new Bean(' trim_me ', function () {});
            injector.bean(bean);

            expect(injector._beans['trim_me']).to.be.a(Bean);
            expect(injector._beans['trim_me'].name).to.eql('trim_me');
        });

        it('should fail if a bean with the same name already exists', function () {
            var injector = getInjector();
            var bean = new Bean('myBean', function () {});
            injector.bean(bean);

            expect(injector.bean.bind(injector, bean)).to.throwError(/is already defined/);
        });

        it('should fail if a bean with a value name', function () {
            var injector = getInjector();
            var bean = new Bean(injector._valueDelimiter + 'myBean', function () {});

            expect(injector.bean.bind(injector, bean)).to.throwError(/Cannot start with/);
        });

        it('should fail if a bean with an empty name', function () {
            var injector = getInjector();
            var bean = new Bean('', function () {});

            expect(injector.bean.bind(injector, bean)).to.throwError(/Cannot be empty/);
        });
    });

    describe('#inject', function () {

        it('should init the bean using a factory', function () {
            var injector = getInjector();
            var fn = injector.inject(new Bean('myBean', function () {
                return {
                    myProperty: true
                };
            }, { factory: true }));

            expect(fn().myProperty).to.eql(true);
        });

        it('should init the bean using a constructor', function () {
            var injector = getInjector();
            var fn = injector.inject(new Bean('myBean', function () {
                this.myProperty = true;
            }, { factory: false }));

            expect(fn().myProperty).to.eql(true);
        });

        it('should inject dependencies into a bean', function () {
            var injector = getInjector();
            injector._beans['myBean1'] = new Bean('myBean1', function () {
                return 'value';
            });

            var fn = injector.inject(new Bean('myBean2', function (myBean1) {
                return 'myBean1 = ' + myBean1;
            }, { inject: ['myBean1'] }));

            expect(fn()).to.eql('myBean1 = value');
        });

        it('should inject values into a bean', function () {
            var injector = getInjector();
            injector._values = {
                db: {
                    hostname: 'localhost',
                    port: 27071
                }
            };

            var fn = injector.inject(new Bean('connString', function (hostname, port) {
                return 'mongodb://' + hostname + ':' + port;
            }, { inject: ['#db.hostname', '#db.port'] }));

            expect(fn()).to.eql('mongodb://localhost:27071');
        });

        it('should fail if a injected value is not defined', function () {
            var injector = getInjector();
            var bean = new Bean('myBean', function (notDefined) {}, { inject: ['#notDefined'] });

            expect(injector.inject.bind(injector, bean)).to.throwError(/Could not find value/);
        });
    });

    describe('#init', function () {

        it('should initialize a bean', function () {
            var injector = getInjector();
            var instance = injector.init(new Bean('myBean', function () {
                return 'myValue';
            }));

            expect(instance).to.eql('myValue');
            expect(injector._instances['myBean']).to.be.ok();
        });

        it('should inject dependencies into a bean and initialize it', function () {
            var injector = getInjector();
            injector._beans['myBean1'] = new Bean('myBean1', function () {
                return 'value';
            });
            var myBean2 = new Bean('myBean2', function (myBean1) {
                return 'myBean1 = ' + myBean1;
            }, { inject: ['myBean1'] });

            var instance = injector.init(myBean2);
            expect(instance).to.eql('myBean1 = value');
            expect(injector._instances['myBean1']).to.be.ok();
            expect(injector._instances['myBean2']).to.be.ok();
        });

        it('should inject values into a bean and initialize it', function () {
            var injector = getInjector();
            injector._values = {
                db: {
                    hostname: 'localhost',
                    port: 27071
                }
            };
            var bean = new Bean('connString', function (hostname, port) {
                return 'mongodb://' + hostname + ':' + port;
            }, { inject: ['#db.hostname', '#db.port'] });

            expect(injector.init(bean)).to.eql('mongodb://localhost:27071');
        });

        it('should initialize a singleton bean only once', function () {
            var injector = getInjector();
            var count = 0;
            var bean = new Bean('myBean', function () {
                return ++count;
            }, { singleton: true });

            expect(injector.init(bean)).to.eql(1);
            expect(injector.init(bean)).to.eql(1);
        });

        it('should initialize a non-singleton bean multiple times', function () {
            var injector = getInjector();
            var count = 0;
            var bean = new Bean('myBean', function () {
                return ++count;
            }, { singleton: false });

            expect(injector.init(bean)).to.eql(1);
            expect(injector.init(bean)).to.eql(2);
        });
    });
});