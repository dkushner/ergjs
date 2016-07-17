'use strict';

if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
  (function () {
    var handleDispatch = function handleDispatch(id, task, context, dependencies) {
      var rebuilt = eval(task);

      if (typeof rebuilt === 'string') {
        rebuilt = registry[rebuilt];
      }

      var rehydrated = context ? JSON.parse(context) : null;
      var result = rebuilt.call(this, rehydrated);

      postMessage({ id: id, type: 'dispatch', result: result });
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

    self.onmessage = function (_ref) {
      var data = _ref.data;
      var id = data.id;
      var type = data.type;

      console.log(data);

      try {
        switch (type) {
          case 'dispatch':
            return handleDispatch(id, data.task, data.context, data.dependencies);
          case 'register':
            return handleRegister(id, data.name, data.task);
          case 'load':
            return handleLoad(id, data.paths);
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