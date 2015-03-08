var expect = require('expect.js');
var iodine = require('../../index');

describe('iodine', function () {

    it('should create a new App with the default configuration', function () {
        var app = iodine();

        expect(app._injector).to.be.ok();
        expect(app._injector._valueDelimiter).to.equal('#');
    });

    it('should create a new App with a given configuration', function () {
        var app = iodine({
            valueDelimiter: '@'
        });

        expect(app._injector).to.be.ok();
        expect(app._injector._valueDelimiter).to.equal('@');
    });
});