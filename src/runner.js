if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
  const registry = {};

  function handleDispatch(id, task, context, dependencies) {
    const rebuilt = eval(task);
    const rehydrated = JSON.parse(context);
    const result = rebuilt.call(this, rehydrated);

    postMessage({ id, type: 'dispatch', result });
  }

  function handleRegister(id, name, task) {
    const rehydrated = eval(task);
    
    registry[name] = rhydrated;

    postMessage({ id, type: 'register', result: true });
  }

  self.onmessage = ({ data }) => {
    console.log("[WORKER] Received: ", data);
    const { id, type } = data;

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
}
