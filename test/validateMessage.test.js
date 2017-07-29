'use strict';

var expect = require('chai').expect;
var fs = require('fs');
var sinon = require('sinon');
var m = require('./../lib/validateMessage');
var format = require('util').format;

describe('validate-commit-msg.js', function() {
  var originalLog, originalError;
  var errors = [];
  var logs = [];
  var writeFileSyncStub;

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
    writeFileSyncStub = sinon.stub(fs, 'writeFileSync');

    function fakeError() {
      var msg = format.apply(null, arguments);
      errors.push(msg.replace(/\x1B\[\d+m/g, '')); // uncolor
    }

    function fakeLog() {
      var msg = format.apply(null, arguments);
      logs.push(msg.replace(/\x1B\[\d+m/g, '')); // uncolor
    }
  });

  afterEach(function() {
    console.log = originalLog;
    console.error = originalError;
    fs.writeFileSync.restore();
    m.config.autoFix = false;
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
      expect(m.validateMessage('fix(build): Use of `template` tags')).to.equal(VALID);

      expect(errors).to.deep.equal([]);
      expect(logs).to.deep.equal([]);
    });

    it('should resolve types from module', function() {
      var typesBackup = m.config.types;
      m.config.types = 'conventional-commit-types';

      expect(m.validateMessage('chore($controller): something')).to.equal(VALID);
      expect(m.validateMessage('chore(*): something')).to.equal(VALID);
      expect(m.validateMessage('chore(foo-bar): something')).to.equal(VALID);
      expect(m.validateMessage('chore(guide/location): something')).to.equal(VALID);
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

      m.config.types = typesBackup;
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
      expect(errors[0]).to.equal('INVALID COMMIT MSG: "weird" is not allowed type ! Valid types are: ' + m.config.types.join(', '));
      expect(logs).to.deep.equal([msg]);
    });

    it('should require a scope', function() {
      var msg = 'feat: Add new feature';

      m.config.scope = {
        validate: true,
        allowed: '*',
        required: true
      };

      expect(m.validateMessage(msg)).to.equal(INVALID);
      expect(errors[0]).to.equal('INVALID COMMIT MSG: a scope is required !');
      expect(logs).to.deep.equal([msg]);

      m.config.scope = undefined;
    });

    it('should validate scope', function() {
      var msg = 'feat(nonexistant): Add new feature';

      m.config.scope = {
        validate: true,
        allowed: ['button', 'card']
      };

      expect(m.validateMessage(msg)).to.equal(INVALID);
      expect(errors[0]).to.equal('INVALID COMMIT MSG: "nonexistant" is not an allowed scope ! Valid scope are: ' + m.config.scope.allowed.join(', '));
      expect(logs).to.deep.equal([msg]);

      m.config.scope = undefined;
    });

    it('should only allow a single scope when multiples is off', function() {
      var msg = 'feat(button,card): Add new feature';

      m.config.scope = {
        validate: true,
        allowed: '*'
      };

      expect(m.validateMessage(msg)).to.equal(INVALID);
      expect(errors[0]).to.equal('INVALID COMMIT MSG: only one scope can be provided !');
      expect(logs).to.deep.equal([msg]);

      m.config.scope = undefined;
    });

    it('should catch an invalid scope among many', function() {
      var msg = 'feat(button,card,ripple): Add new feature';

      m.config.scope = {
        validate: true,
        allowed: ['button', 'card'],
        multiple: true
      };

      expect(m.validateMessage(msg)).to.equal(INVALID);
      expect(errors[0]).to.equal('INVALID COMMIT MSG: "ripple" is not an allowed scope ! Valid scope are: ' + m.config.scope.allowed.join(', '));
      expect(logs).to.deep.equal([msg]);

      m.config.scope = undefined;
    });

    it('should allow any scope if "*" is defined', function() {
      var msg = 'feat(anything): Fixed';

      m.config.scope = {
        validate: true
      };

      expect(m.validateMessage(msg)).to.equal(VALID);
      expect(logs).to.deep.equal([]);

      m.config.scope = undefined;
    });

    it('should allow no scope when only validate is set to true', function() {
      var msg = 'chore: Publish';

      m.config.scope = {
        validate: true
      };

      expect(m.validateMessage(msg)).to.equal(VALID);
      expect(logs).to.deep.equal([]);

      m.config.scope = undefined;
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
      expect(m.validateMessage('Merge branch master into validate-commit-msg-integration')).to.equal(VALID);
      expect(m.validateMessage('Merge branch \'master\' into validate-commit_msg-integration')).to.equal(VALID);
      expect(m.validateMessage('Merge branch \'master\' of')).to.equal(VALID);
      expect(m.validateMessage('Merge remote-tracking branch \'master\' into validate-commit-msg-integration')).to.equal(VALID);
      expect(m.validateMessage('Merge something from somewhere to everywhere :)')).to.equal(VALID);
    });

    it('should validate subject against subjectPattern if provided', function() {
      var subjectPatternBackup = m.config.subjectPattern;
      m.config.subjectPattern = /^A.*Z$/;

      var msg = 'chore(build): A something Z';
      expect(m.validateMessage(msg)).to.equal(VALID);

      msg = 'chore(build): something';
      expect(m.validateMessage(msg)).to.equal(INVALID);

      expect(errors).to.deep.equal(['INVALID COMMIT MSG: subject does not match subject pattern!']);
      expect(logs).to.deep.equal([msg]);

      m.config.subjectPattern = subjectPatternBackup;
    });

    it('should lowercase type when autoFix is true and make it valid', function() {
      m.config.autoFix = true;
      var msg = 'Chore(build): A something Z';
      expect(m.validateMessage(msg, 'file')).to.equal(VALID);
    });

    it('should show invalid when autoFix is false and type starts with capital letter', function() {
      var msg = 'Chore(build): A something Z';
      expect(m.validateMessage(msg)).to.equal(INVALID);
    });

    it('should update the file provided when autoFix is true and there are changes', function() {
      m.config.autoFix = true;
      var msg = 'Chore(build): A something Z';
      var msgValid = 'chore(build): a something Z';
      m.validateMessage(msg, 'file');
      expect(writeFileSyncStub.calledWith('file', msgValid)).to.equal(VALID);
    });

    it('should not update the file provided when autoFix is true and there are no changes', function() {
      m.config.autoFix = true;
      var msg = 'chore(build): a something Z';
      m.validateMessage(msg, 'file');
      expect(writeFileSyncStub.called).to.equal(INVALID);
    });
  });

});
