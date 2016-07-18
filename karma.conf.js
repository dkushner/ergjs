// Karma configuration
// Generated on Fri Jul 15 2016 10:10:32 GMT-0700 (PDT)

module.exports = function(config) {
  config.set({
    basePath: '',
    customLaunchers: {
      ChromeTravis: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    frameworks: ['mocha', 'chai', 'browserify'],
    preprocessors: {
      'test/**/*.test.js': ['browserify']
    },
    browserify: {
      debug: true,
      transform: ['babelify']
    },
    files: [
      'lib/erg.js',
      'test/**/*.test.js',
      { pattern: 'lib/runner.js', included: false, served: true },
      { pattern: 'test/dependency.js', included: false, served: true }
    ],
    exclude: [ ],
    reporters: ['mocha'],
    client: {
      mocha: {
        reporter: 'spec'
      }
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: [
      (process.env.TRAVIS) ? 'ChromeTravis' : 'Chrome', 
      'Firefox'
    ],
    singleRun: true,
    concurrency: 1,
    browserNoActivityTimeout: 30000
  })
}
