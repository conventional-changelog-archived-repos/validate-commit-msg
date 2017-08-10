#!/usr/bin/env node

/**
 * Git COMMIT-MSG hook for validating commit message
 * See https://docs.google.com/document/d/1rk04jEuGfk9kYzfqCuOlPTSJw3hEDZJTBN5E5f1SALo/edit
 *
 * This CLI supports 3 usage ways:
 * 1. Default usage is not passing any argument. It will automatically read from COMMIT_EDITMSG file.
 * 2. Passing a file name argument from git directory. For instance GIT GUI stores commit msg @GITGUI_EDITMSG file.
 * 3. Passing commit message as argument. Useful for testing quickly a commit message from CLI.
 *
 * Installation:
 * >> cd <angular-repo>
 * >> ln -s ../../validate-commit-msg.js .git/hooks/commit-msg
 */

'use strict';

var fs = require('fs');
var path = require('path');

var getGitFolder = require('./getGitFolder');
var validateMessage = require('../index');

var commitMsgFileOrText = process.argv[2];
var commitErrorLogPath = process.argv[3];

// On running the validation over a text instead of git files such as COMMIT_EDITMSG and GITGUI_EDITMSG
// is possible to be doing that the from anywhere. Therefore the git directory might not be available.
var gitDirectory;
try {
  gitDirectory = getGitFolder();

  if (!commitErrorLogPath) {
    commitErrorLogPath = path.resolve(gitDirectory, 'logs/incorrect-commit-msgs');
  }
} catch (err) {}

var bufferToString = function (buffer) {
  var hasToString = buffer && typeof buffer.toString === 'function';

  return hasToString && buffer.toString();
}

var getCommit = function (msgFileOrText) {
  if (msgFileOrText !== undefined) {
    return getCommitFromFile(msgFileOrText) || { message: msgFileOrText };
  }

  return getCommitFromFile('COMMIT_EDITMSG') || { message: null };
}

var getCommitFromFile = function (file) {
  if (!gitDirectory || !file) {
    return null;
  }

  file = path.resolve(gitDirectory, file);
  var message = getFileContent(file);

  return (!message) ? null : {
    message: message,
    sourceFile: file
  };
}

var getFileContent = function (filePath) {
  try {
    var buffer = fs.readFileSync(filePath);

    return bufferToString(buffer);
  } catch (err) {
    // Ignore these error types because it is most likely validating
    // a commit from a text instead of a file
    if (err && err.code !== 'ENOENT' && err.code !== 'ENAMETOOLONG') {
      throw err;
    }
  }
}

var validate = function (msgFileOrText) {
  var commit = getCommit(msgFileOrText);

  if (!validateMessage(commit.message, commit.sourceFile) && commitErrorLogPath) {
    fs.appendFileSync(commitErrorLogPath, commit.message + '\n');
    process.exit(1);
  }

  process.exit(0);
}

validate(commitMsgFileOrText);
