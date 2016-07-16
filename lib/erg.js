"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Task manager and worker thread coordinator.
 */

var Erg = function () {
  function Erg(base) {
    var _this = this;

    _classCallCheck(this, Erg);

    this.worker = new Worker([base, "runner.js"].join('/'));
    this.worker.onmessage = this.receive.bind(this);
    this.connected = false;
    this.ready = new Promise(function (resolve, reject) {
      setTimeout(function () {
        if (_this.connected) {
          resolve(_this);
        } else {
          reject("Worker failed to initialize before timeout of " + Erg.WAIT_TIME + ".");
        }
      }, Erg.WAIT_TIME);
    });
    this.waiting = {};
  }

  _createClass(Erg, [{
    key: "receive",
    value: function receive(message) {
      console.log("[MAIN] Received: ", message);
      var _message$data = message.data;
      var type = _message$data.type;
      var id = _message$data.id;
      var result = _message$data.result;


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
  }, {
    key: "register",
    value: function register(name, task) {
      var _this2 = this;

      var id = Erg.taskId();
      this.worker.postMessage({ id: id, type: 'register', name: name, task: task });

      return new Promise(function (resolve, reject) {
        _this2.waiting[id] = { resolve: resolve, reject: reject };
      });
    }
  }, {
    key: "dispatch",
    value: function dispatch(task, context, dependencies) {
      var _this3 = this;

      var id = Erg.taskId();
      this.worker.postMessage({
        id: id,
        type: 'dispatch',
        task: task.toString(),
        context: JSON.stringify(context),
        dependencies: dependencies
      });

      return new Promise(function (resolve, reject) {
        _this3.waiting[id] = { resolve: resolve, reject: reject };
      });
    }
  }], [{
    key: "taskId",
    value: function taskId() {
      return "task" + ++Erg.ID;
    }
  }]);

  return Erg;
}();

;

Erg.WAIT_TIME = 3000;
Erg.ID = 0;