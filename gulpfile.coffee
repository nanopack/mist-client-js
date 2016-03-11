gulp      = require 'gulp'

bump      = require 'gulp-bump'
clean     = require 'gulp-clean'
coffee    = require 'gulp-coffee'
fs        = require 'fs'
gutil     = require 'gulp-util'
haml      = require 'gulp-haml'
knox      = require 'knox'
open      = require "gulp-open"
prettify  = require 'gulp-prettify'
rename    = require 'gulp-rename'
uglify    = require 'gulp-uglify'

version = undefined

#
_markup = () ->
  gulp.src("./src/index.html", { read: false })
    .pipe( clean({ force: true }),
      gulp.src('./src/index.haml')
        .pipe( haml() )
        .pipe( prettify() )
        .pipe( gulp.dest('./src') )
    )

#
_scripts = () ->
  _version ( ->
    gulp.src("./dist/*.js", { read: false })
      .pipe( clean({ force: true }),
        gulp.src([ "./src/*.coffee" ])
          .pipe( coffee({ bare: true }).on('error', gutil.log) ).on('error', gutil.beep)

          # src (unminified and unversioned)
          .pipe( gulp.dest('./src') )

          # dist
          .pipe( uglify() )

          # minified unversioned
          .pipe( rename({ suffix: ".min" }) )
          .pipe( gulp.dest('./dist') )

          # minified versioned
          .pipe( rename({ suffix: ".#{version}.min" }) )
          .pipe( gulp.dest('./dist') )
      )
    )

#
_bump = (type) ->
  gulp.src('./package.json')
    .pipe(bump({ type: type || 'patch' }))
    .pipe(gulp.dest('./'))

#
_publish = () ->
  _version ( ->
    file = "mist-client-js.#{version}.min.js"

    fs.readFile "./dist/#{file}", (err, data) ->
      return console.log "Unable to read file #{file} :: #{err}" if err

      client = knox.createClient
        key:      process.env['PAGODA_AWS_ACCESS_KEY_ID'],
        secret:   process.env['PAGODA_AWS_SECRET_ACCESS_KEY'],
        endpoint: 's3-us-west-2.amazonaws.com',
        bucket:   'tools.nanopack.io'

      req = client.put("mist-client-js.#{version}.min.js",
        "Content-Length": data.length
        "Content-Type": "application/javascript"
      )

      req.on "response", (res) ->
        if res.statusCode == 200 then console.log "Saved #{file} to #{req.url}"
        else console.log "Unable to save file #{file} :: [#{res.statusCode}]#{req.url}"

      req.end data
  )

#
_version = (cb) ->
  fs.readFile './package.json', (err, data) ->
    return console.log "Unable to read package.json :: #{err}" if err

    version = JSON.parse(data).version

    return cb()

#
_watch = () ->
  gulp.watch "./src/*.haml", -> _markup()
  gulp.watch "./src/*.coffee", -> _scripts()


## tasks
gulp.task 'bump', () -> _bump(gulp.env.type)
gulp.task 'compile', () -> _markup(); _scripts()
gulp.task 'publish', () -> _publish()

gulp.task 'default', [ 'compile' ], -> _watch()
