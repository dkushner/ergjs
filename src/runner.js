if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
  const registry = {};

  function handleDispatch(id, task, context, dependencies) {
    let rebuilt = eval(task);
    
    if (typeof rebuilt === 'string') {
      rebuilt = registry[rebuilt];
    } 

    const rehydrated = (context) ? JSON.parse(context) : null;
    const result = rebuilt.call(this, rehydrated);

    postMessage({ id, type: 'dispatch', result });
  }

  function handleRegister(id, name, task) {
    const rehydrated = eval(task);
    
    registry[name] = rehydrated;

    postMessage({ id, type: 'register', result: true });
  }

  self.onmessage = ({ data }) => {
    const { id, type } = data;
    console.log(data);

    try {
      switch (type) {
        case 'dispatch': 
          return handleDispatch(id, data.task, data.context, data.dependencies);
        case 'register':
          return handleRegister(id, data.name, data.task);
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
