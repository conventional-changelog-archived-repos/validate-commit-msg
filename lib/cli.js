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
var gitRawCommits = require('git-raw-commits');
var program = require('commander');

var getGitFolder = require('./getGitFolder');
var validateMessage = require('../index');

var commitErrorLogPath;
var commitMsgFileOrText;

program
  .option('--from <branch/tag/commit>', 'Specify a source. ex: --from=develop')
  .arguments('[msgFileOrText] [errorLogPath]')
  .action(function (msgFileOrText, errorLogPath) {
    commitMsgFileOrText = msgFileOrText;
    commitErrorLogPath = errorLogPath;
  })
  .parse(process.argv);

// On running the validation over a text instead of git files such as COMMIT_EDITMSG and GITGUI_EDITMSG
// is possible to be doing that the from anywhere. Therefore the git directory might not be available.
var gitDirectory;
try {
  gitDirectory = getGitFolder();

  if (!commitErrorLogPath) {
    commitErrorLogPath = gitDirectory + '/logs/incorrect-commit-msgs';
  }
} catch (err) {}

if (program.from) {
  validateMany(program.from);
} else {
  validateSingle(commitMsgFileOrText);
}


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
  if (!commitErrorLogPath || program.from) {
    return;
  }

  fs.appendFileSync(commitErrorLogPath, message + '\n');
}

function validate(message, sourceFile) {
  if (!validateMessage(message, sourceFile)) {
    saveError(message);

    return false;
  }

  return true;
}

function validateMany(from) {
  var errorsCount = 0;

  gitRawCommits({ from })
    .setEncoding()
    .on('data', (message) => {
      if (!validate(message)) {
        errorsCount += 1;
      }
    })
    .on('close', () => process.exit(errorsCount));
}

function validateSingle(msgFileOrText) {
  var commit = getCommit(msgFileOrText);
  var errorsCount = 0;

  if (!validate(commit.message, commit.sourceFile)) {
    errorsCount += 1;
  }

  process.exit(errorsCount);
}
