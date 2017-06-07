'use strict';

var util = require('util');
var semverRegex = require('semver-regex');
var getConfig = require('./config').getConfig;
var chalk = require('chalk');

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
  console[config.warnOnFail ? 'warn' : 'error'](chalk.red('INVALID COMMIT MSG: ') + util.format.apply(null, arguments));
};

exports.config = config;

exports.validateMessage = function validateMessage(raw) {
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
    error('does not match "<' + chalk.cyan('type') + '>(<' + chalk.yellow('scope') + '>): <' + chalk.green('subject') + '>" !');
    isValid = false;
  } else {
    var firstLine = match[1];
    var squashing = !!match[2];
    var type = match[3];
    var scope = match[4];
    var subject = match[5];

    var SUBJECT_PATTERN = new RegExp(config.subjectPattern || '.+');
    var SUBJECT_PATTERN_ERROR_MSG = config.subjectPatternErrorMsg || chalk.yellow('subject') + ' does not match subject pattern!';

    if (firstLine.length > MAX_LENGTH && !squashing) {
      error('is longer than ' + chalk.yellow('%d') + ' characters !', MAX_LENGTH);
      isValid = false;
    }

    // If should auto fix type then do it here
    if (config.autoFix) {
      type = lowercase(type);
    }

    if (types !== '*' && types.indexOf(type) === -1) {
      error(chalk.yellow('"%s"') + ' is not allowed type ! Valid types are: ' + chalk.green('%s'), type, types.join(', '));
      isValid = false;
    }

    isValid = validateScope(isValid, scope);

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

function lowercase(string) {
  return string.toLowerCase();
}

function lowercaseFirstLetter(string) {
  return lowercase(string.charAt(0)) + string.slice(1);
}

function validateScope(isValid, scope) {
  config.scope = config.scope || {};
  var validateScopes = config.scope.validate || false;
  var multipleScopesAllowed = config.scope.multiple || false;
  var allowedScopes = config.scope.allowed || '*';
  var scopeRequired = config.scope.required || false;
  var scopes = scope ? scope.split(',') : [];

  function validateIndividualScope(item) {
    if (allowedScopes[0].trim() === '*') {
      return;
    }
    if (allowedScopes.indexOf(item) === -1) {
      error(chalk.yellow('"%s"') + ' is not an allowed scope ! Valid scope are: ' + chalk.green('%s'), item, allowedScopes.join(', '));
      isValid = false;
    }
  }

  if (validateScopes) {
    if (scopeRequired && scopes.length === 0) {
      error('a ' + chalk.yellow('scope') + ' is required !');
      isValid = false;
    }
    // If scope is not provided, we ignore the rest of the testing and do early
    // return here.
    if (scopes.length === 0) {
      return isValid;
    }
    if (isValid && multipleScopesAllowed) {
      scopes.forEach(validateIndividualScope);
    }
    if (isValid && !multipleScopesAllowed) {
      if (scopes.length > 1) {
        error('only one ' + chalk.yellow('scope') + ' can be provided !');
        isValid = false;
      }
      if (isValid) {
        validateIndividualScope(scopes[0]);
      }
    }
  }

  return isValid;
};
