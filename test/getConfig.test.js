'use strict';

var getConfig = require('../lib/getConfig');
var expect = require('chai').expect;

describe('getConfig', function() {
  it('returns the validate-commit-msg config object if exists', function() {
    var config = getConfig();
    expect(config.helpMessage).to.contain('fix your commit message');
    expect(config.types.length).to.equal(10);
    expect(config.warnOnFail).to.equal(false);
    expect(config.autoFix).to.equal(false);
  });
});
