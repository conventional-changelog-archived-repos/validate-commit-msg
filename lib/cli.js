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
  var commitMsgFileOrText,
      gitFolder = getGitFolder() + '/',
  //GIT GUI stores commit msg @GITGUI_EDITMSG file, so user can pass file name has argument 
  //if it doesn't exist then we are considering "/COMMIT_EDITMSG" file
    filename = (process.argv[2] && fs.existsSync(gitFolder  + process.argv[2])) ? process.argv[2] : 'COMMIT_EDITMSG';

  var bufferToString = function (buffer) {
    return hasToString(buffer) && buffer.toString();
  };

  var hasToString = function (x) {
    return x && typeof x.toString === 'function';
  };

  var validate = function (msg, isFile, filename) {
    if (!validateMessage(msg)) {
      var incorrectLogFile = (
        isFile
        ? commitMsgFileOrText.replace(filename, 'logs/incorrect-commit-msgs')
        : (getGitFolder() + '/logs/incorrect-commit-msgs')
      );

      fs.appendFile(incorrectLogFile, msg + '\n', function appendFile() {
        process.exit(1);
      });
    } else {
      process.exit(0);
    }
  };

  commitMsgFileOrText = gitFolder + filename;

  fs.readFile(commitMsgFileOrText, function readFile(err, buffer) {
    if(err && err.code !== 'ENOENT') {
      throw err;
    }

    var isFile = !err;
    var msg = (
      isFile
      ? bufferToString(buffer)
      : commitMsgFileOrText
    );

    validate(msg, isFile, filename);
  });
}
