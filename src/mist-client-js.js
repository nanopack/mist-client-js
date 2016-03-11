var Mist,
  slice = [].slice;

Mist = (function() {
  var _backlog, _events, _log_levels;

  _backlog = [];

  _log_levels = ['DEBUG', 'INFO', 'WARN', 'ALERT', 'ERROR', 'SILENT'];

  Mist.prototype.debug = function() {
    var args, data, key;
    key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
    return this.log({
      level: 'DEBUG',
      styles: 'color:#48B5DA',
      key: key,
      data: data,
      args: args
    });
  };

  Mist.prototype.info = function() {
    var args, data, key;
    key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
    return this.log({
      level: 'INFO',
      styles: 'color:#87C45A',
      key: key,
      data: data,
      args: args
    });
  };

  Mist.prototype.warn = function() {
    var args, data, key;
    key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
    return this.log({
      level: 'WARN',
      styles: 'color:#FCF1AB',
      key: key,
      data: data,
      args: args
    });
  };

  Mist.prototype.alert = function() {
    var args, data, key;
    key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
    return this.log({
      level: 'ALERT',
      styles: 'color:#FEA06B',
      key: key,
      data: data,
      args: args
    });
  };

  Mist.prototype.error = function() {
    var args, data, key;
    key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
    return this.log({
      level: 'ERROR',
      styles: 'color:#F22C68',
      key: key,
      data: data,
      args: args
    });
  };

  Mist.prototype.has_permission = function(level) {
    return _log_levels.indexOf(this.LOG_LEVEL) <= _log_levels.indexOf(level);
  };

  Mist.prototype.log = function(options) {
    var log;
    log = {
      level: options.level,
      styles: options.styles,
      key: options.key,
      data: options.data,
      args: options.args,
      timestamp: new Date()
    };
    if (this.LOGS_ENABLED && this.has_permission(log.level)) {
      console.log("%cMist.log:" + log.level + " ::", log.styles, log.key, log.data);
    }
    return _backlog.push(log);
  };

  Mist.prototype.backlog = function() {
    var i, len, log, results;
    results = [];
    for (i = 0, len = _backlog.length; i < len; i++) {
      log = _backlog[i];
      results.push(console.log("%c(" + log.timestamp + ") Mist.backlog:" + log.level + " ::", log.styles, log.key + " - ", log.data));
    }
    return results;
  };

  Mist.prototype.enable_logs = function() {
    this.warn("Mist logs enabled");
    return this.LOGS_ENABLED = true;
  };

  Mist.prototype.disable_logs = function() {
    this.warn("Mist logs disabled");
    return this.LOGS_ENABLED = false;
  };

  Mist._self = null;

  function Mist(options1) {
    this.options = options1 != null ? options1 : {};
    if (this.constructor._self) {
      return this.constructor._self;
    }
    this.LOGS_ENABLED = this.options.logs_enabled || false;
    this.LOG_LEVEL = this.options.log_level || 'SILENT';
    this.on("mist:_socket.onopen", (function(_this) {
      return function() {
        var args, evnt, key;
        key = arguments[0], evnt = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return _this.debug(key, evnt, args);
      };
    })(this));
    this.on("mist:_socket.reconnect", (function(_this) {
      return function() {
        var args, evnt, key;
        key = arguments[0], evnt = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return _this.debug(key, evnt, args);
      };
    })(this));
    this.on("mist:_socket.onmessage", (function(_this) {
      return function() {
        var args, evnt, key;
        key = arguments[0], evnt = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return _this.info(key, evnt, args);
      };
    })(this));
    this.on("mist:_socket.onerror", (function(_this) {
      return function() {
        var args, evnt, key;
        key = arguments[0], evnt = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return _this.error(key, evnt, args);
      };
    })(this));
    this.on("mist:_socket.onclose", (function(_this) {
      return function() {
        var args, evnt, key;
        key = arguments[0], evnt = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return _this.debug(key, evnt, args);
      };
    })(this));
    this.on("mist:command.ping", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return _this.debug(key, data, args);
      };
    })(this));
    this.on("mist:command.subscribe", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return _this.debug(key, data, args);
      };
    })(this));
    this.on("mist:command.unsubscribe", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return _this.debug(key, data, args);
      };
    })(this));
    this.on("mist:command.subscriptions", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return console.log("%cMist.log ::", key, data);
      };
    })(this));
    this.on("mist:data", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return _this.debug(key, data, args);
      };
    })(this));
    this.on("mist:data.error", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return _this.error(key, data, args);
      };
    })(this));
    this.on("mist:metadata.action:create", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return _this.debug(key, data, args);
      };
    })(this));
    this.on("mist:metadata.action:update", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return _this.debug(key, data, args);
      };
    })(this));
    this.on("mist:metadata.action:destroy", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return _this.debug(key, data, args);
      };
    })(this));
    this.constructor._self = this;
  }

  _events = {};

  Mist.prototype._has_event = function(key) {
    return _events[key] != null;
  };

  Mist.prototype._has_handler = function(key, handler) {
    return _events[key].indexOf(handler) !== -1;
  };

  Mist.prototype._add_handler = function(key, handler) {
    _events[key] || (_events[key] = []);
    if (!this._has_handler(key, handler)) {
      return _events[key].push(handler);
    }
  };

  Mist.prototype._remove_handler = function(key, handler) {
    if (!(this._has_event(key) && this._has_handler(key, handler))) {
      return;
    }
    return _events[key].splice(_events[key].indexOf(handler), 1);
  };

  Mist.prototype.on = function(key, handler) {
    if (!(key && handler)) {
      return;
    }
    this._add_handler(key, handler);
    return handler;
  };

  Mist.prototype.once = function(key, handler) {
    var handler_wrapper;
    handler_wrapper = (function(_this) {
      return function() {
        if (handler != null) {
          handler.apply(_this, arguments);
        }
        return _this.off(key, handler_wrapper);
      };
    })(this);
    return this.on(key, handler_wrapper);
  };

  Mist.prototype.off = function(key, handler) {
    if (key && handler) {
      return this._remove_handler(key, handler);
    } else if (key) {
      return delete _events[key];
    } else {
      return _events = {};
    }
  };

  Mist.prototype.fire = function() {
    var args, data, handler, i, key, len, ref;
    key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
    if (!_events[key]) {
      return;
    }
    ref = _events[key];
    for (i = 0, len = ref.length; i < len; i++) {
      handler = ref[i];
      if (handler != null) {
        handler.apply(this, [key, data, args]);
      }
    }
    return true;
  };

  Mist.prototype.events = function(key) {
    if (!key) {
      return this.log("Registered Events - ", _events);
    }
    if (this._has_event(key)) {
      return _events[key];
    } else {
      return this.log("Unknown event - ", key);
    }
  };

  Mist.prototype.connect = function(socket_url, reconnect) {
    var ref, ref1, ref2, ref3;
    if (reconnect == null) {
      reconnect = false;
    }
    this._socket_url = socket_url;
    this._socket = new WebSocket(socket_url);
    if ((ref = this._socket) != null) {
      ref.onopen = (function(_this) {
        return function(evnt) {
          _this.fire('mist:_socket.onopen', evnt);
          if (reconnect) {
            return _this.fire('mist:_socket.reconnect', evnt);
          }
        };
      })(this);
    }
    if ((ref1 = this._socket) != null) {
      ref1.onerror = (function(_this) {
        return function(evnt) {
          return _this.fire('mist:_socket.onerror', evnt);
        };
      })(this);
    }
    if ((ref2 = this._socket) != null) {
      ref2.onclose = (function(_this) {
        return function(evnt) {
          return _this.fire('mist:_socket.onclose', evnt);
        };
      })(this);
    }
    if ((ref3 = this._socket) != null) {
      ref3.onmessage = (function(_this) {
        return function(evnt) {
          var action, command, data, error, metadata;
          _this.fire.apply(_this, ['mist:_socket.onmessage'].concat(slice.call(arguments)));
          data = JSON.parse(evnt.data);
          _this.fire('mist:data', data);
          if (error = data != null ? data.error : void 0) {
            _this.fire('mist:data.error', data.error);
          }
          if (command = data != null ? data.command : void 0) {
            switch (command) {
              case 'ping':
                _this.fire("mist:command.ping", data);
                break;
              case 'subscribe':
                _this.fire('mist:command.subscribe', data);
                break;
              case 'unsubscribe':
                _this.fire('mist:command.unsubscribe', data);
                break;
              case 'list':
                _this.fire("mist:command.subscriptions", data.subscriptions);
            }
          }
          if (metadata = JSON.parse((data != null ? data.data : void 0) || false)) {
            if (action = metadata.action) {
              switch (action) {
                case 'create':
                  return _this.fire('mist:metadata.action:create', data);
                case 'update':
                  return _this.fire('mist:metadata.action:update', data);
                case 'destroy':
                  return _this.fire('mist:metadata.action:destroy', data);
              }
            }
          }
        };
      })(this);
    }
    return this._socket;
  };

  Mist.prototype.reconnect = function() {
    this.disconnect();
    return this.connect(this._socket_url, true);
  };

  Mist.prototype.disconnect = function() {
    var ref;
    return (ref = this._socket) != null ? ref.close() : void 0;
  };

  Mist.prototype.subscribe = function(tags) {
    var ref;
    if (tags == null) {
      tags = [];
    }
    if (this.is_connected()) {
      if ((ref = this._socket) != null) {
        ref.send(JSON.stringify({
          command: 'subscribe',
          tags: tags
        }));
      }
    } else {
      this.once("mist:_socket.onopen", (function(_this) {
        return function(e) {
          return _this.subscribe(tags);
        };
      })(this));
    }
    return tags;
  };

  Mist.prototype.unsubscribe = function(tags) {
    var ref;
    if (tags == null) {
      tags = [];
    }
    if (this.is_connected()) {
      if ((ref = this._socket) != null) {
        ref.send(JSON.stringify({
          command: 'unsubscribe',
          tags: tags
        }));
      }
    } else {
      this.once("mist:_socket.onopen", (function(_this) {
        return function(e) {
          return _this.unsubscribe(tags);
        };
      })(this));
    }
  };

  Mist.prototype.subscriptions = function() {
    var ref;
    if (this.is_connected()) {
      if ((ref = this._socket) != null) {
        ref.send(JSON.stringify({
          command: 'list'
        }));
      }
    } else {
      this.once("mist:_socket.onopen", (function(_this) {
        return function(e) {
          return _this.subscriptions();
        };
      })(this));
    }
  };

  Mist.prototype.state = function() {
    var ref, ref1;
    switch ((ref = this._socket) != null ? ref.readyState : void 0) {
      case 0:
        return 'not connected';
      case 1:
        return 'open';
      case 2:
        return 'closing';
      case 3:
        return 'closed';
      default:
        return "unknown state - " + ((ref1 = this._socket) != null ? ref1.readyState : void 0);
    }
  };

  Mist.prototype.is_connected = function() {
    return this.state() === 'open';
  };

  Mist.prototype.ping = function() {
    var ref;
    return (ref = this._socket) != null ? ref.send(JSON.stringify({
      command: 'ping'
    })) : void 0;
  };

  return Mist;

})();
