var expect = require('expect.js');
var iodine = require('../../index');

describe('iodine', function () {

    it('should create a new App with the default configuration', function () {
        var app = iodine();

        expect(app._injector).to.be.ok();
        expect(app._injector._valueDelimiter).to.equal('#');
        expect(app._logger).to.be.a('function');
    });

    it('should create a new App with a given configuration', function () {
        var config = {
            valueDelimiter: '@',
            logger: function (type, message) {
                console.log(message);
            }
        };
        var app = iodine(config);

        expect(app._injector).to.be.ok();
        expect(app._injector._valueDelimiter).to.equal('@');
        expect(app._logger).to.equal(config.logger);
    });
});