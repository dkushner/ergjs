window.URL = window.URL || window.webkitURL;

/**
 * Task manager and worker thread coordinator.
 */
class Erg {
  /**
   * @param {string} base The base path where 
  constructor(base) {
    this.worker = new Worker([base, "runner.js"].join('/'));
    this.worker.onmessage = this.receive.bind(this);
    this.connected = false;
    this.ready = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this.connected) {
          resolve(this);
        } else {
          reject(`Worker failed to initialize before timeout of ${Erg.WAIT_TIME}.`);
        }
      }, Erg.WAIT_TIME);
    });
    this.waiting = {};
  }

  static taskId() {
    return `task${++Erg.ID}`;
  }

  receive(message) {
    console.log("[MAIN] Received: ", message);
    const { type, id, result } = message.data;

    switch (type) {
      case 'ready': 
        this.connected = true;
        break;
      case 'dispatch': 
      case 'register':
        this.waiting[id].resolve(result);
        delete this.waiting[id];
        break;
      default: 
        break;
    }
  }

  register(name, task) {
    const id = Erg.taskId();
    this.worker.postMessage({ id, type: 'register', name, task });

    return new Promise((resolve, reject) => {
      this.waiting[id] = { resolve, reject };
    });
  }

  dispatch(task, context, dependencies) {
    const id = Erg.taskId();
    this.worker.postMessage({
      id,
      type: 'dispatch',
      task: task.toString(),
      context: JSON.stringify(context),
      dependencies
    });

    return new Promise((resolve, reject) => {
      this.waiting[id] = { resolve, reject };
    });
  }
};

Erg.WAIT_TIME = 3000;
Erg.ID = 0;
