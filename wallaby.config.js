module.exports = function() {
  return {
    files: ['lib/**/*.js', 'package.json'],
    tests: ['test/**/*.js'],
    env: {
      type: 'node'
    }
  };
};
