module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: [
      'jasmine'
    ],
    files: [
      'test/*.spec.ts',
      'test/**/*.spec.ts'
    ],
    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/**/*.spec.ts': ['webpack'],
      'src/**/*.ts': ['webpack']
    },
    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    //reporters: ['progress'],

    plugins: [
      'karma-webpack',
      'karma-jasmine',
      'karma-phantomjs-launcher'
    ],
    browsers: [
      'PhantomJS'
    ],
    mime: {
      'text/x-typescript': ['ts','tsx']
    },
    autoWatch: true,
    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,
    // how many browser should be started simultaneous
    concurrency: Infinity,
  })
}
