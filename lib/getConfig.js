'use strict';

var findup = require('findup');
var fs = require('fs');
var resolve = require('path').resolve;

module.exports = function getConfig() {
  var pkgFile = findup.sync(process.cwd(), 'package.json');
  var pkg = JSON.parse(fs.readFileSync(resolve(pkgFile, 'package.json')));
  return pkg && pkg.config && pkg.config['validate-commit-msg'] || {};
};
