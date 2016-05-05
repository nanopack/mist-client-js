var Mist,
  slice = [].slice;

Mist = (function() {
  function Mist(options) {
    this.options = options != null ? options : {};
    if (typeof Eventify === "undefined" || typeof dash === "undefined") {
      console.warn("You are missing the following dependencies: \n\t" + (typeof Eventify === 'undefined' ? 'Eventify (https://github.com/sdomino/eventify)' : '') + " \n\t" + (typeof dash === 'undefined' ? 'Dash (https://github.com/sdomino/dash)' : '') + " \n\nThe Mist client will be unable to function properly until all dependencies are satisfied.");
      return;
    }
    Eventify.extend(this);
    dash.setPrefix("Mist");
    dash.setLevel(this.options.logLevel || "DEBUG");
    if (this.options.logsEnabled) {
      dash.enableLogs();
    }
    this.on("mist:_socket.onopen", (function(_this) {
      return function() {
        var args, evnt, key;
        key = arguments[0], evnt = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return dash.debug(key, evnt, args);
      };
    })(this));
    this.on("mist:_socket.reconnect", (function(_this) {
      return function() {
        var args, evnt, key;
        key = arguments[0], evnt = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return dash.debug(key, evnt, args);
      };
    })(this));
    this.on("mist:_socket.onmessage", (function(_this) {
      return function() {
        var args, evnt, key;
        key = arguments[0], evnt = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return dash.debug(key, evnt, args);
      };
    })(this));
    this.on("mist:_socket.onerror", (function(_this) {
      return function() {
        var args, evnt, key;
        key = arguments[0], evnt = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return dash.error(key, evnt, args);
      };
    })(this));
    this.on("mist:_socket.onclose", (function(_this) {
      return function() {
        var args, evnt, key;
        key = arguments[0], evnt = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return dash.debug(key, evnt, args);
      };
    })(this));
    this.on("mist:command.ping", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return dash.debug(key, data, args);
      };
    })(this));
    this.on("mist:command.subscribe", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return dash.debug(key, data, args);
      };
    })(this));
    this.on("mist:command.unsubscribe", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return dash.debug(key, data, args);
      };
    })(this));
    this.on("mist:command.publish", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return dash.debug(key, data, args);
      };
    })(this));
    this.on("mist:command.list", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return dash.debug(key, data, args);
      };
    })(this));
    this.on("mist:data", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return dash.debug(key, data, args);
      };
    })(this));
    this.on("mist:data.error", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return dash.error(key, data, args);
      };
    })(this));
    this.on("mist:metadata.action:create", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return dash.debug(key, data, args);
      };
    })(this));
    this.on("mist:metadata.action:update", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return dash.debug(key, data, args);
      };
    })(this));
    this.on("mist:metadata.action:destroy", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return dash.debug(key, data, args);
      };
    })(this));
  }

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
          _this.fire("mist:_socket.onopen", evnt);
          if (reconnect) {
            return _this.fire("mist:_socket.reconnect", evnt);
          }
        };
      })(this);
    }
    if ((ref1 = this._socket) != null) {
      ref1.onerror = (function(_this) {
        return function(evnt) {
          return _this.fire("mist:_socket.onerror", evnt);
        };
      })(this);
    }
    if ((ref2 = this._socket) != null) {
      ref2.onclose = (function(_this) {
        return function(evnt) {
          return _this.fire("mist:_socket.onclose", evnt);
        };
      })(this);
    }
    if ((ref3 = this._socket) != null) {
      ref3.onmessage = (function(_this) {
        return function(evnt) {
          var action, command, data, error, error1, i, len, metadata, ref4, tag;
          _this.fire.apply(_this, ["mist:_socket.onmessage"].concat(slice.call(arguments)));
          data = JSON.parse(evnt.data);
          _this.fire("mist:data", data);
          if (error = data != null ? data.error : void 0) {
            _this.fire('mist:data.error', data.error);
          }
          if (command = data != null ? data.command : void 0) {
            switch (command) {
              case "ping":
                _this.fire("mist:command.ping", data);
                break;
              case "subscribe":
                _this.fire("mist:command.subscribe", data);
                break;
              case "unsubscribe":
                _this.fire("mist:command.unsubscribe", data);
                break;
              case "list":
                _this.fire("mist:command.list", data);
                break;
              case 'publish':
                _this.fire('mist:command.publish', data);
                _this.fire("mist:command.publish:[" + (data.tags.join()) + "]", data);
                ref4 = data.tags;
                for (i = 0, len = ref4.length; i < len; i++) {
                  tag = ref4[i];
                  _this.fire("mist:command.publish:" + tag, data);
                }
            }
          }
          if (data != null ? data.data : void 0) {
            try {
              metadata = JSON.parse(data != null ? data.data : void 0);
              if (action = metadata.action) {
                switch (action) {
                  case "create":
                    return _this.fire("mist:metadata.action:create", data);
                  case "update":
                    return _this.fire("mist:metadata.action:update", data);
                  case "destroy":
                    return _this.fire("mist:metadata.action:destroy", data);
                }
              }
            } catch (error1) {
              return dash.debug("Unable to parse data - " + metadata);
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
          command: "subscribe",
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
          command: "unsubscribe",
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

  Mist.prototype.list = function() {
    var ref;
    if (this.is_connected()) {
      if ((ref = this._socket) != null) {
        ref.send(JSON.stringify({
          command: "list"
        }));
      }
    } else {
      this.once("mist:_socket.onopen", (function(_this) {
        return function(e) {
          return _this.list();
        };
      })(this));
    }
  };

  Mist.prototype.state = function() {
    var ref, ref1;
    switch ((ref = this._socket) != null ? ref.readyState : void 0) {
      case 0:
        return "not connected";
      case 1:
        return "open";
      case 2:
        return "closing";
      case 3:
        return "closed";
      default:
        return "unknown state - " + ((ref1 = this._socket) != null ? ref1.readyState : void 0);
    }
  };

  Mist.prototype.is_connected = function() {
    return this.state() === "open";
  };

  Mist.prototype.ping = function() {
    var ref;
    return (ref = this._socket) != null ? ref.send(JSON.stringify({
      command: "ping"
    })) : void 0;
  };

  return Mist;

})();
