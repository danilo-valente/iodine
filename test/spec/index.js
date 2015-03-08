var expect = require('expect.js');
var iodine = require('../../index');

describe('iodine', function () {

    it('should create a new App with a given configuration', function () {
        var app = iodine({
            valueDelimiter: '@'
        });

        expect(app._config).to.be.ok();
        expect(app._config.valueDelimiter).to.equal('@');
    });
});