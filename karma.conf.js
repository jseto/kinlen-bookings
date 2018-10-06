// var webpack = require('webpack')
process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: [
      'jasmine'
    ],
    files: [
      'test/*.spec.ts'
    ],
    preprocessors: {
      'test/**/*.spec.ts': ['webpack'],
      'src/**/*.ts': ['webpack']
    },
    reporters: [
			'progress',
//			'spec'
		],
    autoWatch: true,
    browsers: [
			// 'Chrome',
      'ChromeHeadless'
    ],
    singleRun: false,
    concurrency: Infinity,
    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },
    plugins: [
      'karma-webpack',
      'karma-jasmine',
			// 'karma-coverage',
			// 'karma-spec-reporter',
      'karma-chrome-launcher'
    ],
		// specReporter: {
		// 	maxLogLines: 1,             // limit number of lines logged per test
		// 	suppressErrorSummary: true, // do not print error summary
		// 	suppressFailed: false,      // do not print information about failed tests
		// 	suppressPassed: true,      // do not print information about passed tests
		// 	suppressSkipped: false,      // do not print information about skipped tests
		// 	showSpecTiming: false,      // print the time elapsed for each spec
		// 	failFast: false              // test would finish with error when a first fail occurs.
		// },

		// coverageReporter: {
		// 	type: 'lcovonly', subdir: 'lcov'
		// },
    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.ts$/,
            use: [{
              loader: 'ts-loader'
            }]
          }
        ]
      },
			node: { fs: 'empty' },
      resolve: {
        extensions: ['.ts', '.js', '.tsx']
      },
      devtool: 'inline-source-map',
      plugins: [
        // existing plugins go here
        // new webpack.SourceMapDevToolPlugin({
        //   filename: null, // if no value is provided the sourcemap is inlined
        //   test: /\.(ts|js)($|\?)/i // process .js and .ts files only
        // })
      ]

    }
  })
}
