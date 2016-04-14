'use strict';

var expect = require('chai').expect;
var fs = require('fs');
var sinon = require('sinon');
var m = require('./index');
var format = require('util').format;

describe('validate-commit-msg.js', function() {
  var originalLog, originalError;
  var errors = [];
  var logs = [];

  var VALID = true;
  var INVALID = false;

  // modify project config for testing
  m.config.helpMessage = undefined;

  beforeEach(function() {
    errors.length = 0;
    logs.length = 0;
    originalLog = console.log;
    originalError = console.error;
    console.error = fakeError;
    console.log = fakeLog;

    sinon.spy(console, 'error');
    sinon.spy(console, 'log');

    function fakeError() {
      var msg = format.apply(null, arguments);
      errors.push(msg.replace(/\x1B\[\d+m/g, '')); // uncolor
    }

    function fakeLog() {
      var msg = format.apply(null, arguments);
      logs.push(msg.replace(/\x1B\[\d+m/g, '')); // uncolor
    }
  });

  describe('validateMessage', function() {

    it('should be valid', function() {
      expect(m.validateMessage('chore($controller): something')).to.equal(VALID);
      expect(m.validateMessage('chore(*): something')).to.equal(VALID);
      expect(m.validateMessage('chore(foo-bar): something')).to.equal(VALID);
      expect(m.validateMessage('chore(guide/location): something')).to.equal(VALID);
      expect(m.validateMessage('custom(baz): something')).to.equal(VALID);
      expect(m.validateMessage('docs($filter): something')).to.equal(VALID);
      expect(m.validateMessage('feat($location): something (another thing)')).to.equal(VALID);
      expect(m.validateMessage('fix($compile): something')).to.equal(VALID);
      expect(m.validateMessage('refactor($httpBackend): something')).to.equal(VALID);
      expect(m.validateMessage('revert(foo): something')).to.equal(VALID);
      expect(m.validateMessage('revert: feat($location): something')).to.equal(VALID);
      expect(m.validateMessage('style($http): something')).to.equal(VALID);
      expect(m.validateMessage('test($resource): something')).to.equal(VALID);

      expect(errors).to.deep.equal([]);
      expect(logs).to.deep.equal([]);
    });


    it('should validate 100 characters length', function() {
      var msg = 'fix($compile): something super mega extra giga tera long, maybe even longer and longer and longer... ';

      expect(m.validateMessage(msg)).to.equal(INVALID);
      expect(errors).to.deep.equal(['INVALID COMMIT MSG: is longer than 100 characters !']);
      expect(logs).to.deep.equal([msg]);
    });


    it('should work fine with a bigger body', function() {
      var message = [
        'chore(build): something',
        '', // BLANK_LINE
        'Something longer that is more descriptive',
        '', // BLANK LINE
        'Closes #14',
        'BREAKING CHANGE: Something is totally broken :-('
      ].join('\n');

      expect(m.validateMessage(message)).to.equal(VALID);
      expect(errors).to.deep.equal([]);
      expect(logs).to.deep.equal([]);
    });


    it('should validate "<type>(<scope>): <subject>" format', function() {
      var msg = 'not correct format';

      expect(m.validateMessage(msg)).to.equal(INVALID);
      expect(errors).to.deep.equal(['INVALID COMMIT MSG: does not match "<type>(<scope>): <subject>" !']);
      expect(logs).to.deep.equal([msg]);
    });

    it('should log the helpMessage on invalid commit messages', function() {
      var msg = 'invalid message';
      m.config.helpMessage = '\nPlease fix your commit message (and consider using http://npm.im/commitizen)\n';
      expect(m.validateMessage(msg)).to.equal(INVALID);
      expect(errors).to.deep.equal(['INVALID COMMIT MSG: does not match "<type>(<scope>): <subject>" !']);
      expect(logs).to.deep.equal([msg, m.config.helpMessage]);
      m.config.helpMessage = undefined;
    });

    it('should show the entire body when using the %s placeholder', function() {
      var message = [
        'some header',
        '', // BLANK_LINE
        'Elaborated body'
      ].join('\n');
      m.config.helpMessage = '%s';
      expect(m.validateMessage(message)).to.equal(INVALID);
      expect(logs).to.deep.equal([message]);
    });

    it('should interpolate message into helpMessage', function() {
      var msg = 'invalid message';
      m.config.helpMessage = '\nPlease fix your %s\n';
      var res = format(m.config.helpMessage, msg);
      expect(m.validateMessage(msg)).to.equal(INVALID);

      m.config.helpMessage = undefined; // reset before failure
      expect(errors).to.deep.equal(['INVALID COMMIT MSG: does not match "<type>(<scope>): <subject>" !']);
      expect(logs).to.deep.equal([res]);
    });

    it('should validate type', function() {
      var msg = 'weird($filter): something';

      expect(m.validateMessage(msg)).to.equal(INVALID);
      expect(errors).to.deep.equal(['INVALID COMMIT MSG: "weird" is not allowed type !']);
      expect(logs).to.deep.equal([msg]);
    });


    it('should allow empty scope', function() {
      expect(m.validateMessage('fix: blablabla')).to.equal(VALID);
      expect(errors).to.deep.equal([]);
      expect(logs).to.deep.equal([]);
    });


    it('should allow dot in scope', function() {
      expect(m.validateMessage('chore(mocks.$httpBackend): something')).to.equal(VALID);
      expect(errors).to.deep.equal([]);
      expect(logs).to.deep.equal([]);
    });


    it('should ignore msg prefixed with "WIP "', function() {
      expect(m.validateMessage('WIP stuff')).to.equal(VALID);
      expect(errors).to.deep.equal([]);
      expect(logs).to.not.deep.equal([]);
    });

    it('should allow for empty commits', function() {
      expect(m.validateMessage('# this is just a comment')).to.equal(INVALID);
      expect(logs).to.deep.equal(['Aborting commit due to empty commit message.']);
    });


    it('should handle undefined message"', function() {
      expect(m.validateMessage()).to.equal(INVALID);
    });


    it('should allow semver style commits', function() {
      expect(m.validateMessage('v1.0.0-alpha.1')).to.equal(VALID);
    });


    it('should allow fixup! and squash! commits', function() {
      expect(m.validateMessage('fixup! fix($compile): something')).to.equal(VALID);
      expect(m.validateMessage('squash! fix($compile): something super mega extra giga tera long, maybe even longer and longer and longer...')).to.equal(VALID);
    });

    it('should handle merge commits', function() {
      expect(m.validateMessage('Merge branch \'master\' into validate-commit-msg-integration')).to.equal(VALID);
      expect(m.validateMessage('Merge branch master into validate-commit-msg-integration')).to.equal(INVALID);
      expect(m.validateMessage('Merge branch \'master\' into validate-commit_msg-integration')).to.equal(VALID);
    });

    it('should validate subject against subjectPattern if provided', function() {
      var msg = 'chore(build): A something Z';
      m.config.subjectPattern = /^A.*Z$/;
      expect(m.validateMessage(msg)).to.equal(VALID);

      msg = 'chore(build): something';
      expect(m.validateMessage(msg)).to.equal(INVALID);

      expect(errors).to.deep.equal(['INVALID COMMIT MSG: subject does not match subject pattern!']);
      expect(logs).to.deep.equal([msg]);
    });
  });

  describe('handle .git as folder', function()
  {
    before(function() {
      sinon.stub(fs, "existsSync", function() {
        return true;
      });
      sinon.stub(fs, "lstatSync", function() {
        return {
          isDirectory : function() { return true; }
        }
      });
    });

    it('should return ./.git when .git is a directory', function()
    {
      expect(m.getGitFolder()).to.be.equal('./.git');
    });

    after(function() {
      fs.existsSync.restore();
      fs.lstatSync.restore();
    });
  });

  describe('handle .git as file', function()
  {
    before(function() {
      sinon.stub(fs, "existsSync", function() {
        return true;
      });
      sinon.stub(fs, "lstatSync", function(location) {
        //Ensure that we say ./.git is a file, but ../../actual-folder is folder
        return {
          isDirectory : function() { return location != './.git'; }
        }
      });
      sinon.stub(fs, 'readFileSync', function() {
        return 'gitdir: ../../actual-folder';
      });
    });

    it('should load gitdir from .git file', function() {
      expect(m.getGitFolder()).to.be.equal('../../actual-folder');
    });

    after(function() {
      fs.existsSync.restore();
      fs.lstatSync.restore();
      fs.readFileSync.restore();
    });
  });

  describe('handle .git does not exist', function() {
    before(function() {
      sinon.stub(fs, "existsSync", function() {
        return false;
      })
    });

    it('should throw error when ./.git is missing', function() {
        expect(m.getGitFolder).to.throw('Cannot find file ./.git');
    });

    after(function() {
      fs.existsSync.restore();
    });
  });

  describe('handle .git gitdir: folder does not exist', function() {
    before(function() {
      sinon.stub(fs, "existsSync", function(dir) {
        return './.git' == dir;
      });
      sinon.stub(fs, "lstatSync", function(location) {
        //Ensure that we say ./.git is a file, but ../../actual-folder is folder
        return {
          isDirectory : function() { return location != './.git'; }
        }
      });
      sinon.stub(fs, 'readFileSync', function() {
        return 'gitdir: ../../actual-folder';
      })
    });

    it('should throw error when ./.git is missing', function() {
      expect(m.getGitFolder).to.throw('Cannot find file ../../actual-folder');
    });

    after(function() {
      fs.existsSync.restore();
      fs.lstatSync.restore();
      fs.readFileSync.restore();
    });
  });


  afterEach(function() {
    console.log = originalLog;
    console.error = originalError;
  });


});
