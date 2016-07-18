if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
  const registry = {};

  function handleDispatch(id, task, context) {
    let rebuilt = eval(task);
    
    if (typeof rebuilt === 'string') {
      rebuilt = registry[rebuilt];
    } 

    const result = rebuilt.call(null, context);
    postMessage({ id, type: 'dispatch', result });
  }

  function handleReduce(id, task, data) {
    let rebuilt = eval(task);

    if (typeof rebuilt === 'string') {
      rebuilt = registry[rebuilt];
    }

    const result = data.reduce(rebuilt);
    postMessage({ id, type: 'reduce', result });
  }

  function handleMap(id, task, data) {
    let rebuilt = eval(task);

    if (typeof rebuilt === 'string') {
      rebuilt = registry[rebuilt];
    }

    const result = data.map(rebuilt);
    postMessage({ id, type: 'map', result });
  }

  function handleLoad(id, ...paths) {
    importScripts.apply(null, paths);
    postMessage({ id, type: 'load', result: true });
  }

  function handleRegister(id, name, task) {
    const rehydrated = eval(task);
    registry[name] = rehydrated;
    postMessage({ id, type: 'register', result: true });
  }

  self.onmessage = (message) => {
    const { id, type } = message.data;
    const data = message.data;

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
      postMessage({ id, type: 'error', result: e.message });
    }
  };

  // Finish initialization and ping main thread.
  postMessage({ type: 'ready' });
}
