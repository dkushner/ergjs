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
    frameworks: ['jasmine'],
    files: [
      'node_modules/jasmine-promises/dist/jasmine-promises.js',
      'lib/*.js',
      'test/**/*.test.js',
      { pattern: 'test/dependency.js', included: false, served: true }
    ],
    exclude: [ ],
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: [
      (process.env.TRAVIS) ? 'ChromeTravis' : 'Chrome', 
      'Firefox'
    ],
    singleRun: false,
    concurrency: Infinity
  })
}
