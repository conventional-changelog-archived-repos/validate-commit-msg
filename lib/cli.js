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
  var commitMsgFileOrText = process.argv[2] || getGitFolder() + '/COMMIT_EDITMSG';

  var bufferToString = function (buffer) {
    return hasToString(buffer) && buffer.toString();
  };

  var hasToString = function (x) {
    return x && typeof x.toString === 'function';
  };

  var validate = function (msg, isFile) {
    if (!validateMessage(msg)) {
      var incorrectLogFile = (
        isFile
        ? commitMsgFileOrText.replace('COMMIT_EDITMSG', 'logs/incorrect-commit-msgs')
        : (getGitFolder() + '/logs/incorrect-commit-msgs')
      );

      fs.appendFile(incorrectLogFile, msg + '\n', function() {
        process.exit(1);
      });
    } else {
      process.exit(0);
    }
  };

  fs.stat(commitMsgFileOrText, function(err, stat) {
    if(err == null) {
      fs.readFile(commitMsgFileOrText, function(err, buffer) {
        validate(bufferToString(buffer), true);
      });
    } else if(err.code == 'ENOENT') {
      validate(commitMsgFileOrText, false);
    } else {
      throw err;
    }
  });
}
