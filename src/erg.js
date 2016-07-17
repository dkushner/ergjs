// Stringified source for the runner is prepended as RUNNER

window.URL = window.URL || window.webkitURL;

let blob;
try {
  blob = new Blob([RUNNER], { type: 'application/javascript' });
} catch (e) {
  window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
  blob = new BlobBuilder();
  blob.append(RUNNER);
  blob = blob.getBlob();
}

function wait(resolve, reject) {
  const interval = setInterval(() => {
    this.connected && resolve(this);
  }, 100);

  setTimeout(() => {
    if (this.connected) {
      resolve(this);
    } else {
      clearInterval(interval);
      reject(`Worker failed to initialize before timeout of ${Erg.WAIT_TIME}.`);
    }
  }, Erg.WAIT_TIME);
}

/**
 * Task manager and worker thread coordinator.
 */
class Erg {
  /**
   * Creates a new Erg instance. If a path string is passed to this function,
   * the instance will load the worker threads from the runner source file at
   * the given location. If not, the instance will load the workers from a
   * packaged source blob.
   *
   * @param {string} base Base path where the runner source file may be found.
   */
  constructor(base) {
    if (base) {
      this.worker = new Worker([base, "runner.js"].join('/'));
    } else {
      this.worker = new Worker(URL.createObjectURL(blob));
    }

    this.worker.onmessage = this.receive.bind(this);
    this.connected = false;

    this.ready = new Promise(wait.bind(this)).then(() => {
      this.queue.forEach(this.send.bind(this));
    });

    this.queue = [];

    this.waiting = {};
  }

  /**
   * Generates a unique ID for tasks.
   * @return {string} A guaranteed unique task ID.
   */
  static taskId() {
    return `task${++Erg.ID}`;
  }

  /**
   * Handles response messages from the managed workers. 
   *
   * @param {Object} message Web worker message data returned by a managed
   * worker.
   */
  receive(message) {
    const { type, id, result } = message.data;

    switch (type) {
      case 'ready': 
        this.connected = true;
        break;
      case 'error':
        this.waiting[id].reject(result);
        break;
      case 'load':
      case 'dispatch': 
      case 'register':
        this.waiting[id].resolve(result);
        delete this.waiting[id];
        break;
      default: 
        break;
    }
  }

  /**
   * Directly posts or queues a raw message payload for the managed 
   * worker.
   */
  send(payload) {
    if (this.connected) {
      this.worker.postMessage(payload);
    } else {
      this.queue.push(payload);
    }
  }

  /**
   * Loads a script file into the managed workers scope.
   */
  load(...paths) {
    const id = Erg.taskId();

    this.send({
      id,
      type: 'load',
      paths: paths.map((path) => {
        const root = location.protocol + "//" + location.host;

        if (path[0] === '/') {
          return root + path;
        } else {
          return [root, path].join('/');
        }
      })
    });

    return new Promise((resolve, reject) => {
      this.waiting[id] = { resolve, reject };
    });
  }

  /**
   * Allows the user to register and pre-compile a task function with managed 
   * workers so that it may later be invoked by name.
   * @param {string} name The alias to give the task.
   * @param {function} task The task function to alias.
   * @return {Promise<boolean, Error>} A promise resolved when the task has
   * been completed.
   */
  register(name, task) {
    const id = Erg.taskId();
    this.send({ 
      id, 
      type: 'register', 
      name, 
      task: `(${task.toString()})`
    });

    return new Promise((resolve, reject) => {
      this.waiting[id] = { resolve, reject };
    });
  }

  /**
   * Allows the user to dispatch a given task and context to be executed on
   * a managed worker thread.
   * @param {function(context: Object): Object} task The task function to execute.
   * @param {Object} context The execution context to pass to the task
   * function.
   * @return {Promise<Object, Error>} A promise resolved with the result value
   * when the task has been completed.
   */
  dispatch(task, context, dependencies) {
    const id = Erg.taskId();

    if (typeof task === 'string') {
      task = "\"" + task + "\"";
    }

    this.send({
      id,
      type: 'dispatch',
      task: `(${task.toString()})`,
      context: context,
      dependencies
    });

    return new Promise((resolve, reject) => {
      this.waiting[id] = { resolve, reject };
    });
  }
};

Erg.WAIT_TIME = 3000;
Erg.ID = 0;
