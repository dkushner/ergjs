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
      startConnect: true
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

  if (process.env.TRAVIS) {
    var label = "TRAVIS #" + process.env.TRAVIS_BUILD_NUMBER + " (" + process.env.TRAVIS_BUILD_ID + ")";
    config.sauceLabs.build = label;
    config.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;
  }
}
