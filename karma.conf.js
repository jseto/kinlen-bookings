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
    reporters: ['progress'],
    autoWatch: true,
    browsers: [
      'ChromeHeadless'
      // 'Chrome'
    ],
    singleRun: false,
    concurrency: Infinity,
    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },
    plugins: [
      'karma-webpack',
      'karma-jasmine',
      'karma-chrome-launcher'
    ],
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
