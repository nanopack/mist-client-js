The mist javascript client provides a simple API for connecting to and communicating with [mist](https://github.com/nanopack/mist). As the client receives messages from mist it parses and formats the data from the message and then fires corresponding events containing that data that can be handled however you wish.

## New Client

Creating a new client is very easy, and only has a small amount of configurable options:

```coffeescript

# NOTE: by default logs are disabled and set to "DEBUG"
options = {
  logsEnabled : true
  logLevel : "INFO" # 'DEBUG', 'INFO', 'WARN', 'ALERT', 'ERROR', 'SILENT'
}

#
mist = new Mist(options)
```

Once the client is created you simply need to connect it to a running mist server:

`mist.connect("ws://127.0.0.1:8888")`

If authentication is enabled on the server you **must** pass an authentication token to connect:

`mist.connect("ws://127.0.0.1:8888?x-auth-token=TOKEN")`

NOTE: By default mist starts a web socket server running at 127.0.0.1:8888 (as in the example above), which probably wont be the same IP you'll connect to.

## Receiving Messages

To receive messages after you've connected to mist, simply subscribe to tags and then handle the message events the client fires:

```coffeescript
tags = mist.subscribe(['hello'])

#
mist.on "mist:data", (e) => # do stuff
```


## Available Commands

The mist client comes with the same basic commands that mist provides, but also has some web socket specific commands, and event specific commands:

#### Basic Commands

Basic commands are what make up the clients mist API:

| Command | Description | Example |
| --- | --- | --- |
| `ping` | ping the server to test for an active connection | `mist.ping()` |
| `subscribe` | subscribe to messages for *all* `tags` in a group | `mist.subscribe(["tag"])` |
| `unsubscribe` | unsubscribe `tags` | `mist.unsubscribe(["tag"])` |
| `list` | list all active subscriptions for client | `mist.list()` |

#### Client specific commands

Client specific commands deal specifically with the web socket connection to the mist server:

| Command | Description | Example |
| --- | --- | --- |
| `connect` | attempt to connect to a running mist server | `mist.connect("ws://127.0.0.1:1445")` |
| `reconnect` | attempt to re-connect to the server (fires a special event) | `mist.reconnect()` |
| `disconnect` | disconnects from mist | `mist.disconnect()` |
| `state` | returns the state of the socket (not connected, open, closing, closed, unknown) | `mist.state()` |
| `is_connected` | returns whether or not the connection is open | `mist.is_connected()` |

#### Event specific commands

The mist client also comes with its own built in event system. These commands allow you to leverage the system to create any types of events you want based on what data you get back from mist:

| Command | Description | Example |
| --- | --- | --- |
| `on` | handle event | `mist.on(key, handler)` |
| `once` | handle event once | `mist.once(key, handler)` |
| `off` | stop handling event | `mist.off(key, handler)` |
| `fire` | fire event | `mist.fire(key, data, args...)` |
| `events` | list events | `mist.events(key)` |

##### Examples:

```coffeescript

# handle an event
mist.once "mist:event", (data) => # do this only once
mist.on "mist:event", (data) => # do this every fire

# fire an event
mist.fire "mist:event", data
```

## Client events

Below is a list of all of the events that the mist client will fire:

| Command | Fired when |
| --- | --- |
| `mist:_socket.onopen` | the socket connects |
| `mist:_socket.reconnect` | the socket reconnects |
| `mist:_socket.onmessage` | a mist message is received (raw) |
| `mist:_socket.onerror` | the socket errors |
| `mist:_socket.onclose` | the socket disconnects |
| `mist:command.ping` | mist is pinged |
| `mist:command.subscribe` | tags are subscribed |
| `mist:command.unsubscribe` | tags are unsubscribed |
| `mist:command.list` | subscriptions are listed |
| `mist:data` | a mist message is received (parses data) |
| `mist:data.error` | parsed data is/has an error |
| `mist:metadata.action:create` | metadata is created |
| `mist:metadata.action:update` | metadata is updated |
| `mist:metadata.action:destroy` | metadata is destroyed |

## Data formats

#### Standard (string) Data:

Most messages that mist publishes will have data. This data can be anything since it is just a string:

`"data":"hello world!"`

#### JSON Data:

You may want your data to be published in JSON format:

`"data":"{\"greeting\":\"hello world!\"}"`

#### Metadata:

Metadata is simply JSON data that contains nested data specifically formatted to appear as RESTful actions to a database record:

`"data":"{\"data\":{\"model\":\"Greeting\",\"action\":\"update\", \"document\":{\"greeting\":\"hello mist!\", ...}}}"`

## Mist adapter

A mist "adapter" is nothing more than a grouping of mist event handlers that tailor mist messages to a specific framework or library (Angular, React, ect...).

You can have one adapter that does it all, or perhaps multiple adapters, or even no adapter and just handle specific events as needed. It all really depends on the size/scale and architecture of you application.

```coffeescript

#
class exampleMistAdapter

  # all an adapter REQUIRES is an instance of mist.
  constructor : ( mist, @options={} ) ->
    return console.error "A new mist adapter requires an instance of mist" unless mist

    # create custom events to handle custom data
    mist.on "mist:data", (key, data) =>
      if (keys = data?.keys) && (data = JSON.parse(data.data))

        # fire an event and handle it somewhere else
        if data.log then mist.fire "mist:data.log", data

        # or handle an event right here
        if data.alert then console.log 'alert!'

    # create custom events to handle specific models
    mist.on "mist:data.action:create", (key, data) =>
      if (keys = data?.keys) && (data = JSON.parse(data.data))
        switch data.model

          # fire an event and handle it somewhere else
          when 'Post' then mist.fire "mist:data.action:create.post"

          # or handle the event right here
          when 'Comment'

            # you may want to subscribe to something only after another condition
            # is met. This is a good way to reduce bandwidth
            tags = mist.subscribe([ 'like' ])

    #
    mist.on "mist:data.action:update",  (e) =>
      # handle events

    #
    mist.on "mist:data.action:destroy", (e) =>
      if (keys = data?.keys) && (data = JSON.parse(data.data))
        switch data.model

          # fire an event and handle it somewhere else
          when 'Post' then mist.fire "mist:data.action:create.post"

          # or handle the event right here
          when 'Comment'

            # its a good idea to unsubscribe to a channel once you're done with it
            mist.unsubscribe( like_sub )
```

## Contributing

Contributions to the mist js client are welcome and encouraged. This is a [Nanobox](https://nanobox.io) project and contributions should follow the [Nanobox Contribution Process & Guidelines](https://docs.nanobox.io/contributing/).

[![open source](http://nano-assets.gopagoda.io/open-src/nanobox-open-src.png)](http://nanobox.io/open-source)
