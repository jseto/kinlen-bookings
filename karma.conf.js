// var webpack = require('webpack')

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: [
      'jasmine-ajax',
      'jasmine',
      'jquery-3.3.1'
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
      // 'PhantomJS'
      'Chrome'
    ],
    singleRun: false,
    concurrency: Infinity,
    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },
    plugins: [
      'karma-webpack',
      'karma-jasmine',
      'karma-jasmine-ajax',
      'karma-jquery',
      'karma-phantomjs-launcher',
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
