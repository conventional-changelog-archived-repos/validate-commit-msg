'use strict';

var findup = require('findup');
var fs = require('fs');
var path = require('path');
var resolve = path.resolve;

function getConfigObject(filename) {
  try {
    var rcFileExtension = path.extname(filename);
    var rcFileBasePath = findup.sync(process.cwd(), filename);
    var rcFileFullPath = resolve(rcFileBasePath, filename);

    switch(rcFileExtension) {
      case '':
      case '.json':
        return JSON.parse(fs.readFileSync(rcFileFullPath));
      case '.js':
        return require(rcFileFullPath);
      default:
        return null;
    }
  } catch (e) {
    return null;
  }
}

function getRcConfig() {
  return getConfigObject('.vcmrc') || getConfigObject('.vcmrc.js');
}

function getPackageConfig() {
  var configObject = getConfigObject('package.json');
  return configObject && configObject.config && configObject.config['validate-commit-msg'];
}

function getConfig() {
  return getRcConfig() || getPackageConfig() || {};
}

module.exports = {
  getConfig: getConfig,
  getRcConfig: getRcConfig,
  getPackageConfig: getPackageConfig,
  getConfigObject: getConfigObject
};
