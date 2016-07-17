var RUNNER = "\'use strict\';if (typeof WorkerGlobalScope !== \'undefined\' && self instanceof WorkerGlobalScope) {  (function () {    var handleDispatch = function handleDispatch(id, task, context, dependencies) {      var rebuilt = eval(task);      if (typeof rebuilt === \'string\') {        rebuilt = registry[rebuilt];      }      var result = rebuilt.call(null, context);      postMessage({ id: id, type: \'dispatch\', result: result });    };    var handleLoad = function handleLoad(id) {      for (var _len = arguments.length, paths = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {        paths[_key - 1] = arguments[_key];      }      importScripts.apply(null, paths);      postMessage({ id: id, type: \'load\', result: true });    };    var handleRegister = function handleRegister(id, name, task) {      var rehydrated = eval(task);      registry[name] = rehydrated;      postMessage({ id: id, type: \'register\', result: true });    };    var registry = {};    self.onmessage = function (message) {      var _message$data = message.data;      var id = _message$data.id;      var type = _message$data.type;      var data = message.data;      try {        switch (type) {          case \'dispatch\':            return handleDispatch(id, data.task, data.context, data.dependencies);          case \'register\':            return handleRegister(id, data.name, data.task);          case \'load\':            return handleLoad(id, data.paths);          default:            break;        }      } catch (e) {        postMessage({ id: id, type: \'error\', result: e.message });      }    };        postMessage({ type: \'ready\' });  })();}";
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Stringified source for the runner is prepended as RUNNER

window.URL = window.URL || window.webkitURL;

var blob = void 0;
try {
  blob = new Blob([RUNNER], { type: 'application/javascript' });
} catch (e) {
  window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
  blob = new BlobBuilder();
  blob.append(RUNNER);
  blob = blob.getBlob();
}

function wait(resolve, reject) {
  var _this = this;

  var interval = setInterval(function () {
    _this.connected && resolve(_this);
  }, 100);

  setTimeout(function () {
    if (_this.connected) {
      resolve(_this);
    } else {
      clearInterval(interval);
      reject('Worker failed to initialize before timeout of ' + Erg.WAIT_TIME + '.');
    }
  }, Erg.WAIT_TIME);
}

/**
 * Task manager and worker thread coordinator.
 */

var Erg = function () {
  /**
   * Creates a new Erg instance. If a path string is passed to this function,
   * the instance will load the worker threads from the runner source file at
   * the given location. If not, the instance will load the workers from a
   * packaged source blob.
   *
   * @param {string} base Base path where the runner source file may be found.
   */

  function Erg(base) {
    var _this2 = this;

    _classCallCheck(this, Erg);

    if (base) {
      this.worker = new Worker([base, "runner.js"].join('/'));
    } else {
      this.worker = new Worker(URL.createObjectURL(blob));
    }

    this.worker.onmessage = this.receive.bind(this);
    this.connected = false;

    this.ready = new Promise(wait.bind(this)).then(function () {
      _this2.queue.forEach(_this2.send.bind(_this2));
    });

    this.queue = [];

    this.waiting = {};
  }

  /**
   * Generates a unique ID for tasks.
   * @return {string} A guaranteed unique task ID.
   */


  _createClass(Erg, [{
    key: 'receive',


    /**
     * Handles response messages from the managed workers. 
     *
     * @param {Object} message Web worker message data returned by a managed
     * worker.
     */
    value: function receive(message) {
      var _message$data = message.data;
      var type = _message$data.type;
      var id = _message$data.id;
      var result = _message$data.result;


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

  }, {
    key: 'send',
    value: function send(payload) {
      if (this.connected) {
        this.worker.postMessage(payload);
      } else {
        this.queue.push(payload);
      }
    }

    /**
     * Loads a script file into the managed workers scope.
     */

  }, {
    key: 'load',
    value: function load() {
      var _this3 = this;

      var id = Erg.taskId();

      for (var _len = arguments.length, paths = Array(_len), _key = 0; _key < _len; _key++) {
        paths[_key] = arguments[_key];
      }

      this.send({
        id: id,
        type: 'load',
        paths: paths.map(function (path) {
          var root = location.protocol + "//" + location.host;

          if (path[0] === '/') {
            return root + path;
          } else {
            return [root, path].join('/');
          }
        })
      });

      return new Promise(function (resolve, reject) {
        _this3.waiting[id] = { resolve: resolve, reject: reject };
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

  }, {
    key: 'register',
    value: function register(name, task) {
      var _this4 = this;

      var id = Erg.taskId();
      this.send({
        id: id,
        type: 'register',
        name: name,
        task: '(' + task.toString() + ')'
      });

      return new Promise(function (resolve, reject) {
        _this4.waiting[id] = { resolve: resolve, reject: reject };
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

  }, {
    key: 'dispatch',
    value: function dispatch(task, context, dependencies) {
      var _this5 = this;

      var id = Erg.taskId();

      if (typeof task === 'string') {
        task = "\"" + task + "\"";
      }

      this.send({
        id: id,
        type: 'dispatch',
        task: '(' + task.toString() + ')',
        context: context,
        dependencies: dependencies
      });

      return new Promise(function (resolve, reject) {
        _this5.waiting[id] = { resolve: resolve, reject: reject };
      });
    }
  }], [{
    key: 'taskId',
    value: function taskId() {
      return 'task' + ++Erg.ID;
    }
  }]);

  return Erg;
}();

;

Erg.WAIT_TIME = 3000;
Erg.ID = 0;