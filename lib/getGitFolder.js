'use strict';

var fs = require('fs');

module.exports = function getGitFolder() {
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
};
