'use strict';

var fs = require('fs');
var util = require('util');
var resolve = require('path').resolve;
var findup = require('findup');
var semverRegex = require('semver-regex');

var config = getConfig();
var MAX_LENGTH = config.maxSubjectLength || 100;
var IGNORED = new RegExp(util.format('(^WIP)|(^%s$)', semverRegex().source));

// fixup! and squash! are part of Git, commits tagged with them are not intended to be merged, cf. https://git-scm.com/docs/git-commit
var PATTERN = /^((fixup! |squash! )?(\w+)(?:\(([^\)\s]+)\))?: (.+))(?:\n|$)/;
var MERGE_COMMIT_PATTERN = /^Merge /;
var error = function() {
  // gitx does not display it
  // http://gitx.lighthouseapp.com/projects/17830/tickets/294-feature-display-hook-error-message-when-hook-fails
  // https://groups.google.com/group/gitx/browse_thread/thread/a03bcab60844b812
  console[config.warnOnFail ? 'warn' : 'error']('INVALID COMMIT MSG: ' + util.format.apply(null, arguments));
};


var validateMessage = function(raw) {
  var types = config.types = config.types || 'conventional-commit-types';

  // resolve types from a module
  if (typeof types === 'string' && types !== '*') {
    types = Object.keys(require(types).types);
  }

  var messageWithBody = (raw || '').split('\n').filter(function(str) {
    return str.indexOf('#') !== 0;
  }).join('\n');

  var message = messageWithBody.split('\n').shift();

  if (message === '') {
    console.log('Aborting commit due to empty commit message.');
    return false;
  }

  var isValid = true;

  if (MERGE_COMMIT_PATTERN.test(message)) {
    console.log('Merge commit detected.');
    return true
  }

  if (IGNORED.test(message)) {
    console.log('Commit message validation ignored.');
    return true;
  }

  var match = PATTERN.exec(message);

  if (!match) {
    error('does not match "<type>(<scope>): <subject>" !');
    isValid = false;
  } else {
    var firstLine = match[1];
    var squashing = !!match[2];
    var type = match[3];
    var scope = match[4];
    var subject = match[5];

    var SUBJECT_PATTERN = new RegExp(config.subjectPattern || '.+');
    var SUBJECT_PATTERN_ERROR_MSG = config.subjectPatternErrorMsg || 'subject does not match subject pattern!';

    if (firstLine.length > MAX_LENGTH && !squashing) {
      error('is longer than %d characters !', MAX_LENGTH);
      isValid = false;
    }

    // If should auto fix type then do it here
    if (config.autoFix) {
      type = lowercase(type);
    }

    if (types !== '*' && types.indexOf(type) === -1) {
      error('"%s" is not allowed type ! Valid types are: %s', type, types.join(', '));
      isValid = false;
    }

    if (config.autoFix) {
      subject = lowercaseFirstLetter(subject);
    }

    if (!SUBJECT_PATTERN.exec(subject)) {
      error(SUBJECT_PATTERN_ERROR_MSG);
      isValid = false;
    }
  }

  // Some more ideas, do want anything like this ?
  // - Validate the rest of the message (body, footer, BREAKING CHANGE annotations)
  // - allow only specific scopes (eg. fix(docs) should not be allowed ?
  // - auto add empty line after subject ?
  // - auto remove empty () ?
  // - auto correct typos in type ?
  // - store incorrect messages, so that we can learn

  isValid = isValid || config.warnOnFail;

  if (isValid) { // exit early and skip messaging logics
    return true;
  }

  var argInHelp = config.helpMessage && config.helpMessage.indexOf('%s') !== -1;

  if (argInHelp) {
    console.log(config.helpMessage, messageWithBody);
  } else if (message) {
    console.log(message);
  }

  if (!argInHelp && config.helpMessage) {
    console.log(config.helpMessage);
  }

  return false;
};

// publish for testing
exports.validateMessage = validateMessage;
exports.getGitFolder = getGitFolder;
exports.config = config;

function getConfig() {
  var pkgFile = findup.sync(process.cwd(), 'package.json');
  var pkg = JSON.parse(fs.readFileSync(resolve(pkgFile, 'package.json')));
  return pkg && pkg.config && pkg.config['validate-commit-msg'] || {};
}

function getGitFolder() {
  var gitDirLocation = './.git';
  if (!fs.existsSync(gitDirLocation)) {
    throw new Error('Cannot find file ' + gitDirLocation);
  }

  if (!fs.lstatSync(gitDirLocation).isDirectory()) {
    var unparsedText = '' + fs.readFileSync(gitDirLocation);
    gitDirLocation = unparsedText.substring('gitdir: '.length).trim();
  }

  if (!fs.existsSync(gitDirLocation)) {
    throw new Error('Cannot find file ' + gitDirLocation);
  }

  return gitDirLocation;
}

function lowercase(string) {
  return string.toLowerCase();
}

function lowercaseFirstLetter(string) {
  return lowercase(string.charAt(0)) + string.slice(1);
}
