'use strict';

if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
  (function () {
    var handleDispatch = function handleDispatch(id, task, context) {
      var rebuilt = eval(task);

      if (typeof rebuilt === 'string') {
        rebuilt = registry[rebuilt];
      }

      var result = rebuilt.call(null, context);
      postMessage({ id: id, type: 'dispatch', result: result });
    };

    var handleReduce = function handleReduce(id, task, data) {
      var rebuilt = eval(task);

      if (typeof rebuilt === 'string') {
        rebuilt = registry[rebuilt];
      }

      var result = data.reduce(rebuilt);
      postMessage({ id: id, type: 'reduce', result: result });
    };

    var handleMap = function handleMap(id, task, data) {
      var rebuilt = eval(task);

      if (typeof rebuilt === 'string') {
        rebuilt = registry[rebuilt];
      }

      var result = data.map(rebuilt);
      postMessage({ id: id, type: 'map', result: result });
    };

    var handleLoad = function handleLoad(id) {
      for (var _len = arguments.length, paths = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        paths[_key - 1] = arguments[_key];
      }

      importScripts.apply(null, paths);
      postMessage({ id: id, type: 'load', result: true });
    };

    var handleRegister = function handleRegister(id, name, task) {
      var rehydrated = eval(task);
      registry[name] = rehydrated;
      postMessage({ id: id, type: 'register', result: true });
    };

    var registry = {};

    self.onmessage = function (message) {
      var _message$data = message.data;
      var id = _message$data.id;
      var type = _message$data.type;

      var data = message.data;

      try {
        switch (type) {
          case 'dispatch':
            return handleDispatch(id, data.task, data.context);
          case 'register':
            return handleRegister(id, data.name, data.task);
          case 'load':
            return handleLoad(id, data.paths);
          case 'map':
            return handleMap(id, data.task, data.context);
          case 'reduce':
            return handleReduce(id, data.task, data.context);
          default:
            break;
        }
      } catch (e) {
        postMessage({ id: id, type: 'error', result: e.message });
      }
    };

    // Finish initialization and ping main thread.
    postMessage({ type: 'ready' });
  })();
}