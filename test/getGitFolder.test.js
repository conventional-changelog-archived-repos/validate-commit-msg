'use strict';

var sinon = require('sinon');
var expect = require('chai').expect;
var fs = require('fs');
var resolve = require('path').resolve;
var findParentDir = require('find-parent-dir');
var getGitFolder = require('../lib/getGitFolder');

describe('handle .git as folder', function() {
  before(function() {
    sinon.stub(fs, "existsSync", function() {
      return true;
    });
    sinon.stub(fs, "lstatSync", function() {
      return {
        isDirectory: function() {
          return true;
        }
      }
    });
  });

  it('should return ./.git when .git is a directory', function() {
    expect(getGitFolder()).to.be.equal(resolve('.git'));
  });

  after(function() {
    fs.existsSync.restore();
    fs.lstatSync.restore();
  });
});

describe('handle .git as file', function() {
  before(function() {
    sinon.stub(fs, "existsSync", function() {
      return true;
    });
    sinon.stub(fs, "lstatSync", function(location) {
      //Ensure that we say ./.git is a file, but ../../actual-folder is folder
      return {
        isDirectory: function() {
          return location != resolve('.git');
        }
      }
    });
    sinon.stub(fs, 'readFileSync', function() {
      return 'gitdir: ../../actual-folder';
    });
  });

  it('should load gitdir from .git file', function() {
    expect(getGitFolder()).to.be.equal(resolve('../../actual-folder'));
  });

  after(function() {
    fs.existsSync.restore();
    fs.lstatSync.restore();
    fs.readFileSync.restore();
  });
});

describe('handle .git does not exist', function() {
  before(function() {
    sinon.stub(findParentDir, 'sync', function() {
      return null;
    })
  });

  it('should throw error when ./.git is missing', function() {
    expect(getGitFolder).to.throw('Cannot find .git folder');
  });

  after(function() {
    findParentDir.sync.restore();
  });
});

describe('handle .git gitdir: folder does not exist', function() {
  before(function() {
    sinon.stub(findParentDir, 'sync', function() {
      return resolve('.');
    });
    sinon.stub(fs, "existsSync", function(dir) {
      return dir == resolve('.git');
    });
    sinon.stub(fs, "lstatSync", function(location) {
      //Ensure that we say ./.git is a file, but ../../actual-folder is folder
      return {
        isDirectory: function() {
          return location != resolve('.git');
        }
      }
    });
    sinon.stub(fs, 'readFileSync', function() {
      return 'gitdir: ../../actual-folder';
    });
  });

  it('should throw error when ./.git is missing', function() {
    expect(getGitFolder).to.throw('Cannot find file ../../actual-folder');
  });

  after(function() {
    findParentDir.sync.restore();
    fs.existsSync.restore();
    fs.lstatSync.restore();
    fs.readFileSync.restore();
  });
});
