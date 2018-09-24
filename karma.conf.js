//var webpackConfig = require('./test-webpack.config.js');

module.exports = function( config ) {
  config.set({
    basePath: '',
    frameworks: [
      'jasmine'
    ],
    files: [
      'out/test/*.spec.js'
//      { pattern: 'out/test/**/*.spec.js', watched: false }
    ],
    preprocessors: {
      'out/test/*.spec.js': ['webpack']
//      'out/test/**/*.spec.js': ['webpack']
    },
    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    plugins: [
      'karma-webpack',
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-chrome-launcher'
    ],
    browsers: [
      'PhantomJS'
//      'Chrome'
    ],
    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },
    autoWatch: true,
    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,
    // how many browser should be started simultaneous
    concurrency: Infinity,
    webpack: {
      mode: 'development',
    }
  })
}
