'use strict';

if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
  (function () {
    var handleDispatch = function handleDispatch(id, task, context, dependencies) {
      var rebuilt = eval(task);
      var rehydrated = JSON.parse(context);
      var result = rebuilt.call(this, rehydrated);

      postMessage({ id: id, type: 'dispatch', result: result });
    };

    var handleRegister = function handleRegister(id, name, task) {
      var rehydrated = eval(task);

      registry[name] = rhydrated;

      postMessage({ id: id, type: 'register', result: true });
    };

    var registry = {};

    self.onmessage = function (_ref) {
      var data = _ref.data;

      console.log("[WORKER] Received: ", data);
      var id = data.id;
      var type = data.type;


      switch (type) {
        case 'dispatch':
          return handleDispatch(id, data.task, data.context, data.dependencies);
        case 'register':
          return handleRegister(id, data.name, data.task);
        default:
          break;
      }
    };

    // Finish initialization and ping main thread.
    postMessage({ type: 'ready' });
  })();
}