module.exports = function( config ) {
  config.set({
    basePath: '',
    frameworks: [
      'jasmine'
    ],
    files: [
      'test/*.spec.ts'
//      { pattern: 'out/test/**/*.spec.js', watched: false }
    ],
    preprocessors: {
      'test/**/*.spec.ts': ['webpack'],
      'src/**/*.ts': ['webpack']
    },
    reporters: ['progress'],
    autoWatch: true,
    browsers: [
      'PhantomJS'
//      'Chrome'
    ],
    singleRun: false,
    concurrency: Infinity,
    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },
    plugins: [
      'karma-webpack',
      'karma-jasmine',
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
      }
    }
  })
}
