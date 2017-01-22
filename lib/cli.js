#!/usr/bin/env node

/**
 * Git COMMIT-MSG hook for validating commit message
 * See https://docs.google.com/document/d/1rk04jEuGfk9kYzfqCuOlPTSJw3hEDZJTBN5E5f1SALo/edit
 *
 * Installation:
 * >> cd <angular-repo>
 * >> ln -s ../../validate-commit-msg.js .git/hooks/commit-msg
 */

'use strict';

var fs = require('fs');
var validateMessage = require('../index');
var getGitFolder = require('./getGitFolder');

// hacky start if not run by mocha :-D
// istanbul ignore next
if (process.argv.join('').indexOf('mocha') === -1) {

  var commitMsgFile = process.argv[2] || getGitFolder() + '/COMMIT_EDITMSG';
  var incorrectLogFile = commitMsgFile.replace('COMMIT_EDITMSG', 'logs/incorrect-commit-msgs');

  var hasToString = function hasToString(x) {
    return x && typeof x.toString === 'function';
  };

  fs.readFile(commitMsgFile, function(err, buffer) {
    var msg = getCommitMessage(buffer);

    if (!validateMessage(msg)) {
      fs.appendFile(incorrectLogFile, msg + '\n', function() {
        process.exit(1);
      });
    } else {
      process.exit(0);
    }

    function getCommitMessage(buffer) {
      return hasToString(buffer) && buffer.toString();
    }
  });
}
