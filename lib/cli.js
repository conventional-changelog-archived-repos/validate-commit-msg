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
    commitErrorLogPath = gitDirectory + '/logs/incorrect-commit-msgs';
  }
} catch (err) {}

validate(commitMsgFileOrText);


function bufferToString(buffer) {
  var hasToString = buffer && typeof buffer.toString === 'function';

  return hasToString && buffer.toString();
}

function getCommit(msgFileOrText) {
  return getContentFromFile(msgFileOrText)
    || !msgFileOrText && getContentFromFile('COMMIT_EDITMSG')
    || { message: msgFileOrText };
}

function getContentFromFile(path) {
  if (!gitDirectory) {
    return null;
  }

  var file = gitDirectory + '/' + path;
  var fileContent = getFileContent(file);

  return (!fileContent) ? null : {
    message: fileContent,
    sourceFile: file
  };
}

function getFileContent(filePath) {
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

function saveError(message) {
  if (!commitErrorLogPath) {
    return;
  }

  fs.appendFileSync(commitErrorLogPath, message + '\n');
}

function validate(msgFileOrText) {
  var commit = getCommit(msgFileOrText);

  if (!validateMessage(commit.message, commit.sourceFile)) {
    saveError(commit.message);
    process.exit(1);
  }

  process.exit(0);
}
