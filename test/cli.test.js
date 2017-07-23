'use strict';

var spawnSync = require('child_process').spawnSync;
var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');

var TMP_PATH = path.join(__dirname, 'tmp/');
var GIT_TMP_PATH = path.join(TMP_PATH, '.git');
var LOGS_GIT_TMP_PATH = path.join(GIT_TMP_PATH, 'logs');
var COMMIT_EDITMSG_GIT_TMP_PATH = path.join(GIT_TMP_PATH, 'COMMIT_EDITMSG');
var GITGUI_EDITMSG_GIT_TMP_PATH = path.join(GIT_TMP_PATH, 'GITGUI_EDITMSG');
var CLI_PATH = path.join(__dirname, '../lib/cli.js');

var cliSources = [
  'COMMIT_EDITMSG',
  'commit text argument',
  'commit file argument',
];

function executeCliBySource(cliSource, commitMessage) {
  var options = {};
  var args = [];
  switch (cliSource) {
    case 'COMMIT_EDITMSG': {
      fs.writeFileSync(COMMIT_EDITMSG_GIT_TMP_PATH, commitMessage);
      options.cwd = TMP_PATH;
      break;
    }
    case 'commit text argument': {
      args.push(commitMessage);
      break;
    }
    case 'commit file argument': {
      fs.writeFileSync(GITGUI_EDITMSG_GIT_TMP_PATH, commitMessage);
      options.cwd = TMP_PATH;
      args.push('GITGUI_EDITMSG');
      break;
    }
  }

  return spawnSync(CLI_PATH, args, options);
}

describe('cli', function() {
  beforeEach(function () {
    rimraf.sync(GIT_TMP_PATH);
    mkdirp.sync(GIT_TMP_PATH);
    mkdirp.sync(LOGS_GIT_TMP_PATH);
  });

  describe('all cli sources have the same behavior', function () {
    cliSources.forEach(function (cliSource) {
      describe(cliSource, function () {
        describe('when the commit message is valid', function () {
          it('should not print anything into output', function () {
            var commitMessage = 'chore: This a valid commit message';
            var result = executeCliBySource(cliSource, commitMessage);
            expect(result.stdout.toString()).to.eql('');
            expect(result.stderr.toString()).to.eql('');
            expect(result.status).to.eql(0);
          });
        });

        // only check for COMMIT_EDITMSG because if the other cases are empty
        // then they will fallback to COMMIT_EDITMSG anyway
        if (cliSource === 'COMMIT_EDITMSG') {
          describe('when the commit message is empty', function () {
            it('should print into output the commit message is invalid', function () {
              var commitMessage = '';
              var result = executeCliBySource(cliSource, commitMessage);
              expect(result.stdout.toString()).to.eql('Aborting commit due to empty commit message.\n');
              expect(result.stderr.toString()).to.eql('');
              expect(result.status).to.eql(1);
            });
          });
        }

        describe('when the commit message is not following the rules', function () {
          it('should print into output the commit message is invalid', function () {
            var commitMessage = 'my invalid commit message';
            var result = executeCliBySource(cliSource, commitMessage);
            expect(result.stdout.toString()).to.eql([
              commitMessage + '\n\n',
              'Please fix your commit message (and consider using http://npm.im/commitizen)\n\n'
            ].join(''));
            expect(result.stderr.toString()).to.eql('INVALID COMMIT MSG: does not match "<type>(<scope>): <subject>" !\n');
            expect(result.status).to.eql(1);
          });
        });

        describe('when the commit message is using an invalid type', function () {
          it('should print into output the commit message is invalid', function () {
            var commitMessage = 'patch: my invalid commit message';
            var result = executeCliBySource(cliSource, commitMessage);
            expect(result.stdout.toString()).to.eql([
              commitMessage + '\n\n',
              'Please fix your commit message (and consider using http://npm.im/commitizen)\n\n'
            ].join(''));
            expect(result.stderr.toString()).to.eql([
              'INVALID COMMIT MSG: "patch" is not allowed type ! ',
              'Valid types are: feat, fix, docs, style, refactor, perf, test, chore, revert, custom\n'
            ].join(''));
            expect(result.status).to.eql(1);
          });
        });
      });
    });
  });
});
