'use strict';

var config = require('../lib/config');
var expect = require('chai').expect;
var sinon = require('sinon');
var fs = require('fs');

function testConfigObject(configObject) {
  expect(configObject.helpMessage).to.contain('fix your commit');
}

describe('config', function() {
  before(function() {
    sinon.stub(fs, 'readFileSync', function() {
      return JSON.stringify({
        config: {
          'validate-commit-msg': {
            helpMessage: 'fix your commit'
          }
        }
      });
    });
  });

  describe('getPackageConfig', function() {
    it('returns the validate-commit-msg config object if it exists', function() {
      var configObject = config.getPackageConfig();
      testConfigObject(configObject);
    });
  });

  describe('getRcConfig', function() {
    it('returns the config object if it exists', function() {
      fs.readFileSync.restore();
      sinon.stub(fs, 'readFileSync', function() {
        return JSON.stringify({
          helpMessage: 'fix your commit'
        });
      });
      var configObject = config.getRcConfig();
      testConfigObject(configObject);
    });
  });

  describe('getConfig', function() {
    it('returns .vcmrc config by default', function() {
      var configObject = config.getConfig();
      testConfigObject(configObject);
    });

    it('spec name', function() {
      sinon.stub(config, 'getRcConfig', function() {
        throw null;
      });
      var configObject = config.getConfig();
      testConfigObject(configObject);
      config.getRcConfig.restore();
    });
  });

  describe('getConfigObject', function() {
    it('returns config object given filename', function() {
      fs.readFileSync.restore();
      sinon.stub(fs, 'readFileSync', function() {
        return JSON.stringify({
          helpMessage: 'fix your commit'
        });
      });
      var configObject = config.getConfigObject('package.json');
      expect(configObject.helpMessage).to.equal('fix your commit');
    });

    it('returns null on error', function() {
      fs.readFileSync.restore();
      sinon.stub(fs, 'readFileSync', function() {
        throw new Error();
      });
      var configObject = config.getConfigObject('package.json');
      expect(configObject).to.equal(null);
    });
  });

  after(function() {
    fs.readFileSync.restore();
  });
});
