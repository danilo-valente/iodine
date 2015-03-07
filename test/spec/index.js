var expect = require('expect.js');
var iodine = require('../../index');

describe('iodine', function () {

    it('should create a new App with a given configuration', function () {
        var app = iodine({
            valueDelimiter: '@'
        });

        expect(app.config).to.be.ok();
        expect(app.config.valueDelimiter).to.equal('@');
    });
});