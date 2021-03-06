// Karma configuration
// Generated on Fri Jul 15 2016 10:10:32 GMT-0700 (PDT)

module.exports = function(config) {
  config.set({
    basePath: '',
    customLaunchers: {
      SLChrome: {
        base: 'SauceLabs',
        browserName: 'chrome',
        platform: 'Windows 7',
        version: '51'
      },
      SLFirefox: {
        base: 'SauceLabs',
        browserName: 'firefox',
        version: '47'
      },
      SLEdge: {
        base: 'SauceLabs',
        browserName: 'MicrosoftEdge',
        platform: 'Windows 10',
        version: '13'
      }
    },
    sauceLabs: {
      testName: 'ErgJS Browser Compatability Tests',
      startConnect: (process.env.TRAVIS) ? false : true,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
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
    reporters: ['mocha', 'saucelabs'],
    client: {
      mocha: {
        reporter: 'spec'
      }
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_DEBUG,
    browsers: ['SLChrome', 'SLFirefox', 'SLEdge'],
    autoWatch: false,
    singleRun: true,
    concurrency: 1,
    captureTimeout: 120000,
    browserNoActivityTimeout: 30000
  });
}
