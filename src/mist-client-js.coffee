;class Mist

  # constructor
  constructor : (@options={}) ->

    # check for dependencies
    if typeof(Eventify) == "undefined" || typeof(dash) == "undefined"
      console.warn "You are missing the following dependencies:
        \n\t#{if typeof(Eventify) == 'undefined' then 'Eventify (https://github.com/sdomino/eventify)' else ''}
        \n\t#{if typeof(dash) == 'undefined' then 'Dash (https://github.com/sdomino/dash)' else ''}

        \n\nThe Mist client will be unable to function properly until all dependencies are satisfied."
      return

    # add event capabilities
    Eventify.extend(@)

    # add logging capabilities
    dash.setPrefix("Mist")
    dash.setLevel(@options.logLevel || "DEBUG")
    if @options.logsEnabled then dash.enableLogs()

    #
    # @on "mist:authenticate.done",     (key, data, args...) => dash.debug key, data, args
    # @on "mist:authenticate.fail",     (key, data, args...) => dash.warn key, data, args

    # socket messages
    @on "mist:_socket.onopen",          (key, evnt, args...) => dash.debug key, evnt, args
    @on "mist:_socket.reconnect",       (key, evnt, args...) => dash.debug key, evnt, args
    @on "mist:_socket.onmessage",       (key, evnt, args...) => dash.info key, evnt, args
    @on "mist:_socket.onerror",         (key, evnt, args...) => dash.error key, evnt, args
    @on "mist:_socket.onclose",         (key, evnt, args...) => dash.debug key, evnt, args

    # command messages
    @on "mist:command.ping",            (key, data, args...) => dash.debug key, data, args
    @on "mist:command.subscribe",       (key, data, args...) => dash.debug key, data, args
    @on "mist:command.unsubscribe",     (key, data, args...) => dash.debug key, data, args
    @on "mist:command.publish",         (key, data, args...) => dash.debug key, data, args
    @on "mist:command.list",            (key, data, args...) => dash.log("%cMist.log ::", key, data)

    # data messages
    @on "mist:data",                    (key, data, args...) => dash.debug key, data, args
    @on "mist:data.error",              (key, data, args...) => dash.error key, data, args
    @on "mist:metadata.action:create",  (key, data, args...) => dash.debug key, data, args
    @on "mist:metadata.action:update",  (key, data, args...) => dash.debug key, data, args
    @on "mist:metadata.action:destroy", (key, data, args...) => dash.debug key, data, args

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
    @_socket?.onopen    = (evnt) => @fire "mist:_socket.onopen", evnt; if reconnect then @fire "mist:_socket.reconnect", evnt
    @_socket?.onerror   = (evnt) => @fire "mist:_socket.onerror", evnt
    @_socket?.onclose   = (evnt) => @fire "mist:_socket.onclose", evnt
    @_socket?.onmessage = (evnt) =>
      @fire "mist:_socket.onmessage", arguments...

      # "data":"{\"key\":\"value\", ... }"
      data = JSON.parse evnt.data
      @fire "mist:data", data

      #
      if error = data?.error then @fire 'mist:data.error', data.error

      ## handle mist commands
      if command = data?.command
        switch command
          when "ping"        then @fire "mist:command.ping", data
          when "subscribe"   then @fire "mist:command.subscribe", data
          when "unsubscribe" then @fire "mist:command.unsubscribe", data
          when "list"        then @fire "mist:command.list", data

          # on the publish command we want to fire a generic publish event but
          # also fire an event for all tags and each specific tag; this way
          # anyone consuming these events can get exactly what they want
          when 'publish'
            @fire 'mist:command.publish', data
            @fire "mist:command.publish:[#{data.tags.join()}]", data
            @fire "mist:command.publish:#{tag}", data for tag in data.tags

      ## handle metadata; metadata is data that is specifically formatted to be
      # interpereted as "model" data. It will provide the name of a model, the
      # action the model is performing, and any related data.
      if data?.data

        #
        try

          # "data":"{\"data\":{\"model\":\"Model\",\"action\":\"update\", \"document\":{\"key\":\"value\", ...}}}"
          metadata = JSON.parse(data?.data)

          ## handle actions
          if action = metadata.action
            switch action
              when "create" then @fire "mist:metadata.action:create", data
              when "update" then @fire "mist:metadata.action:update", data
              when "destroy" then @fire "mist:metadata.action:destroy", data

        # this mostlikely happens when there IS data but its formatted incorrectly
        catch
          dash.debug "Unable to parse data - #{metadata}"

    # return the open socket
    @_socket

  # attempt to reconnect to the previously connected socket
  reconnect : () ->
    @disconnect()
    @connect(@_socket_url, true)

  # close the websocket
  disconnect : () -> @_socket?.close()

  # subscribe attempts to subscribe the given tags, then returns those tags
  subscribe : (tags=[]) ->
    if @is_connected() then @_socket?.send JSON.stringify({command:"subscribe", tags:tags})
    else @once "mist:_socket.onopen", (e) => @subscribe(tags)
    tags

  # unsubscribe attempts to unsubscribe the given tags
  unsubscribe : (tags=[]) ->
    if @is_connected() then @_socket?.send JSON.stringify({command:"unsubscribe", tags:tags})
    else @once "mist:_socket.onopen", (e) => @unsubscribe(tags)
    return

  # list returns a list of currently subscribed tags
  list : () ->
    if @is_connected() then @_socket?.send JSON.stringify({command:"list"})
    else @once "mist:_socket.onopen", (e) => @list()
    return

  # state returns the state of the websocket
  state : () ->
    switch @_socket?.readyState
      when 0 then "not connected"
      when 1 then "open"
      when 2 then "closing"
      when 3 then "closed"
      else "unknown state - #{@_socket?.readyState}"

  # returns whether or not the connection is open
  is_connected : () -> (@state() == "open")

  # ping tests the connection to the server
  ping : () -> @_socket?.send JSON.stringify({command:"ping"})
