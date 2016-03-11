;class Mist

  ## logs

  _backlog = [  ]
  _log_levels = [ 'DEBUG', 'INFO', 'WARN', 'ALERT', 'ERROR', 'SILENT' ]

  debug : (key, data, args...) -> @log({ level: 'DEBUG', styles: 'color:#48B5DA', key: key, data: data, args: args })
  info  : (key, data, args...) -> @log({ level: 'INFO',  styles: 'color:#87C45A', key: key, data: data, args: args })
  warn  : (key, data, args...) -> @log({ level: 'WARN',  styles: 'color:#FCF1AB', key: key, data: data, args: args })
  alert : (key, data, args...) -> @log({ level: 'ALERT', styles: 'color:#FEA06B', key: key, data: data, args: args })
  error : (key, data, args...) -> @log({ level: 'ERROR', styles: 'color:#F22C68', key: key, data: data, args: args })

  has_permission : (level) -> _log_levels.indexOf(@LOG_LEVEL) <= _log_levels.indexOf(level)

  log : (options) ->
    log = {
      level:     options.level
      styles:    options.styles
      key:       options.key
      data:      options.data
      args:      options.args
      timestamp: new Date()
    }

    console.log("%cMist.log:#{log.level} ::", log.styles, log.key, log.data) if @LOGS_ENABLED && @has_permission(log.level)

    _backlog.push log

  backlog : () ->
    for log in _backlog
      console.log("%c(#{log.timestamp}) Mist.backlog:#{log.level} ::", log.styles, "#{log.key} - ", log.data)

  enable_logs : () -> @warn "Mist logs enabled"; @LOGS_ENABLED = true
  disable_logs : () -> @warn "Mist logs disabled"; @LOGS_ENABLED = false


  # constructor

  @_self = null

  #
  constructor : ( @options={} ) ->
    return @constructor._self if @constructor._self

    #
    @LOGS_ENABLED = @options.logs_enabled || false
    @LOG_LEVEL    = @options.log_level || 'DEBUG'

    #
    # @on "mist:authenticate.done",     (key, data, args...) => @debug key, data, args
    # @on "mist:authenticate.fail",     (key, data, args...) => @warn key, data, args

    # socket messages
    @on "mist:_socket.onopen",          (key, evnt, args...) => @debug key, evnt, args
    @on "mist:_socket.reconnect",       (key, evnt, args...) => @debug key, evnt, args
    @on "mist:_socket.onmessage",       (key, evnt, args...) => @info key, evnt, args
    @on "mist:_socket.onerror",         (key, evnt, args...) => @error key, evnt, args
    @on "mist:_socket.onclose",         (key, evnt, args...) => @debug key, evnt, args

    # command messages
    @on "mist:command.ping",            (key, data, args...) => @debug key, data, args
    @on "mist:command.subscribe",       (key, data, args...) => @debug key, data, args
    @on "mist:command.unsubscribe",     (key, data, args...) => @debug key, data, args
    @on "mist:command.subscriptions",   (key, data, args...) => console.log("%cMist.log ::", key, data)

    # data messages
    @on "mist:data",                    (key, data, args...) => @debug key, data, args
    @on "mist:data.error",              (key, data, args...) => @error key, data, args
    @on "mist:metadata.action:create",  (key, data, args...) => @debug key, data, args
    @on "mist:metadata.action:update",  (key, data, args...) => @debug key, data, args
    @on "mist:metadata.action:destroy", (key, data, args...) => @debug key, data, args

    #
    @constructor._self = @


  ## events

  _events = {}

  # checks if a given [key] is a registered
  _has_event : (key) -> _events[key]?

  # checks if a given [handler] is registered on a [key]
  _has_handler : (key, handler) -> _events[key].indexOf(handler) != -1

  # add event handler unless it's already present
  _add_handler : (key, handler) ->
    _events[key] ||= []
    _events[key].push handler unless @_has_handler(key, handler)

  # removes given [handler] from [key]
  _remove_handler: (key, handler) ->
    return unless @_has_event(key) && @_has_handler(key, handler)
    _events[key].splice(_events[key].indexOf(handler), 1)

  # registers an event [handler] to a [key]
  on : (key, handler) ->
    return unless key && handler
    @_add_handler(key, handler)
    handler

  # registers an event [handler] to a [key], which once called will be unregistered
  once : (key, handler) ->
    handler_wrapper = =>
      handler?.apply(@, arguments)
      @off(key, handler_wrapper)
    @on(key, handler_wrapper)

  # if [key] and [handler] are provided, unregister [handler] from [key]. If only
  # [key] provided, unregister all [handler]s from [key]. If no arguments provided
  # unregister all events
  off : (key, handler) ->
    if (key && handler) then @_remove_handler(key, handler)
    else if key then delete _events[key]
    else _events = {}

  # fire an event by its registered [key]
  fire : (key, data, args...) ->
    return unless _events[key]
    handler?.apply @, [key, data, args] for handler in _events[key]
    true

  # if [key] is provided, list all registered [handler]s for [key].
  # If no [key] is provided, list all registered [key]s and corresponding [handler]s
  events : (key) ->
    return @log "Registered Events - ", _events unless key
    if @_has_event(key) then _events[key] else @log "Unknown event - ", key


  ## api

  # authenticate with the kernel to register our organization to receive messages
  # authenticate : (auth_url, data={}) ->
  #   $.ajax(
  #     type: 'POST'
  #     url: auth_url
  #     data: data
  #   ).done( ( data, textStatus, jqXHR ) => @fire 'mist:authenticate.done', arguments...
  #   ).fail( ( jqXHR, textStatus, errorThrown ) => @fire 'mist:authenticate.fail', arguments... )


  # connect to the given websocket
  connect : (socket_url, reconnect=false) ->

    # store this so the client can reconnect if needed
    @_socket_url = socket_url

    #
    @_socket = new WebSocket( socket_url )

    #
    @_socket?.onopen    = (evnt) => @fire 'mist:_socket.onopen', evnt; if reconnect then @fire 'mist:_socket.reconnect', evnt
    @_socket?.onerror   = (evnt) => @fire 'mist:_socket.onerror', evnt
    @_socket?.onclose   = (evnt) => @fire 'mist:_socket.onclose', evnt
    @_socket?.onmessage = (evnt) =>
      @fire 'mist:_socket.onmessage', arguments...

      data = JSON.parse evnt.data
      # "data":"{\"key\":\"value\", ... }"

      @fire 'mist:data', data

      #
      if error = data?.error then @fire 'mist:data.error', data.error


      ## handle mist commands
      if command = data?.command
        switch command
          when 'ping'        then @fire "mist:command.ping", data
          when 'subscribe'   then @fire 'mist:command.subscribe', data
          when 'unsubscribe' then @fire 'mist:command.unsubscribe', data
          when 'list'        then @fire "mist:command.subscriptions", data.subscriptions


      ## handle metadata; metadata is data that is specifically formatted to be
      # interpereted as "model" data. It will provide the name of a model, the
      # action the model is performing, and any related data.
      if metadata = JSON.parse( data?.data || false )
        # "data":"{\"data\":{\"model\":\"Model\",\"action\":\"update\", \"document\":{\"key\":\"value\", ...}}}"

        ## handle application actions
        if action = metadata.action
          switch action
            when 'create' then @fire 'mist:metadata.action:create', data
            when 'update' then @fire 'mist:metadata.action:update', data
            when 'destroy' then @fire 'mist:metadata.action:destroy', data

    # return the open socket
    @_socket

  # attempt to reconnect to the previously connected socket
  reconnect : () ->
    @disconnect()
    @connect(@_socket_url, true)

  # close the websocket
  disconnect : () -> @_socket?.close()

  # subscribe attempts to subscribe the given tags
  subscribe : (tags=[]) ->
    if @is_connected() then @_socket?.send JSON.stringify( { command:'subscribe', tags:tags } )
    else @once "mist:_socket.onopen", (e) => @subscribe(tags)
    tags

  # unsubscribe attempts to unsubscribe the given tags
  unsubscribe : (tags=[]) ->
    if @is_connected() then @_socket?.send JSON.stringify( { command:'unsubscribe', tags:tags } )
    else @once "mist:_socket.onopen", (e) => @unsubscribe(tags)
    return

  # subscriptions returns a list of currently subscribed tags
  subscriptions : () ->
    if @is_connected() then @_socket?.send JSON.stringify( { command:'list' } )
    else @once "mist:_socket.onopen", (e) => @subscriptions()
    return

  # state returns the state of the websocket
  state : () ->
    switch @_socket?.readyState
      when 0 then 'not connected'
      when 1 then 'open'
      when 2 then 'closing'
      when 3 then 'closed'
      else "unknown state - #{@_socket?.readyState}"

  # returns whether or not the connection is open
  is_connected : () -> (@state() == 'open')

  # ping tests the connection to the server
  ping : () -> @_socket?.send JSON.stringify( { command:'ping' } )
