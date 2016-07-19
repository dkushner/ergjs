# ergjs
Simplified parallelism in the browser.

[![Build Status](https://travis-ci.org/dkushner/ergjs.svg?branch=master)](https://travis-ci.org/dkushner/ergjs)
[![Build Status](https://saucelabs.com/buildstatus/dkushner)](https://saucelabs.com/beta/builds/7d308342ce924c00bec33bf4c8850866)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/dkushner.svg)](https://saucelabs.com/u/dkushner)

### What's it for?
In modern web applications, computationally expensive operations can tie up the main script evaluation thread and lead to degraded user experiences. `ergjs` provides an easy way to offload these operations into independent, general purpose "threads" called [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers). 

Web Workers are a phenomenal tool for performing heavy computing tasks in the browser but are too heavy for traditional "fire-and-forget" approaches to concurrency supported by native OS threads. Furthermore, the behaviour of Web Workers can vary dramatically between browsers and the Web Worker API may make integrating them into your project seem like more hassle than they're worth. `ergjs` solves this by managing long-lived Web Workers and distributing user-defined tasks among them. 



