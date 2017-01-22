module.exports = function() {
  return {
    files: ['lib/**/*.js', 'package.json', '.vcmrc'],
    tests: ['test/**/*.js'],
    env: {
      type: 'node'
    }
  };
};
