express-minify
==============

Automatically minify (and cache) your JavaScript, CSS and JSON responses without pain.
It also supports LESS/SASS/Stylus/CoffeeScript compiling and minifying.

[![Build Status](https://travis-ci.org/breeswish/express-minify.svg?branch=master)](https://travis-ci.org/breeswish/express-minify) [![npm version](https://img.shields.io/npm/v/express-minify.svg)](https://www.npmjs.com/package/express-minify) [![npm download counter](https://img.shields.io/npm/dm/express-minify.svg)](https://www.npmjs.com/package/express-minify)

[![Dependency Status](https://david-dm.org/breeswish/express-minify.svg)](https://david-dm.org/breeswish/express-minify) [![devDependency Status](https://david-dm.org/breeswish/express-minify/dev-status.svg)](https://david-dm.org/breeswish/express-minify#info=devDependencies)

[![NodeICO](https://nodei.co/npm/express-minify.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/express-minify)

# Installation

```
npm install express-minify
```

# Basic Usage

express-minify takes care of all responses. You don't even need to pass a source directory as other minifying middlewares.

```javascript
var minify = require('express-minify');
app.use(minify());
```

It's very easy and elegant to integrate express-minify with [express.static](http://expressjs.com/en/api.html#express.static) and [compression](https://github.com/expressjs/compression):

```javascript
app.use(compression());
app.use(minify());
app.use(express.static(__dirname + '/static'));
```

Note that the order of the middlewares is important. In the example above, we want to: serve static files → for JS & CSS: minify → GZip → send to user, so we have such orders.

## Options

Default:

```javascript
app.use(minify({
  cache: false,
  uglifyJsModule: null,
  errorHandler: null,
  jsMatch: /javascript/,
  cssMatch: /css/,
  jsonMatch: /json/,
  sassMatch: /scss/,
  lessMatch: /less/,
  stylusMatch: /stylus/,
  coffeeScriptMatch: /coffeescript/,
}));
```

- `cache`: `String | false`

  The directory for cache storage (must be writeable). Pass `false` to cache in the memory (not recommended). If you want to disable cache for specific response, see [Disable Minifying or Caching for Specific Response](#disable-minifying-or-caching-for-specific-response).

- `uglifyJsModule`: `Object`

  Customize [UglifyJS](https://github.com/mishoo/UglifyJS2) (>= 3) module. If not specified, it will be `require('uglify-js')`. Example: [Use Uglify-ES](#use-uglify-es).

- `errorHandler`: `Function(errorInfo, callback)`

  Function to handle compiling and minifying errors. You can determine what to respond for specific kind of error. See [Customize Error Behavior](#customize-error-behavior).

- `jsMatch`: `RegExp | false`

  Matches JavaScript content-type. Pass `false` to disable handling this kind of content.

- `cssMatch`: `RegExp | false`

  Matches CSS content-type. Pass `false` to disable handling this kind of content.

- `jsonMatch`: `RegExp | false`

  Matches JSON content-type. Pass `false` to disable handling this kind of content.

- `sassMatch`: `RegExp | false`

  Matches SASS content-type. Pass `false` to disable handling this kind of content.

- `lessMatch`: `RegExp | false`

  Matches LESS content-type. Pass `false` to disable handling this kind of content.

- `stylusMatch`: `RegExp | false`

  Matches Stylus content-type. Pass `false` to disable handling this kind of content.

- `coffeeScriptMatch`: `RegExp | false`

  Matches CoffeeScript content-type. Pass `false` to disable handling this kind of content.

## Per-response Options

Options below can be supplied for specific response:

- `response.minifyOptions.enabled`: `boolean`

  Pass `false` to disable all kind of processing for this response: no compiling, no minifying.

- `response.minifyOptions.minify`: `boolean`

  Pass `false` to disable minifying (JS, CSS and JSON) for this response, suitable for already-minified contents: [example](#disable-minifying-or-caching-for-a-response).

- `response.minifyOptions.cache`: `boolean`

  Pass `false` to disable caching the processed response data, suitable for dynamic contents: [example](#disable-minifying-or-caching-for-a-response).

- `response.minifyOptions.js`: `Object`

  Set [UglifyJS options](https://github.com/mishoo/UglifyJS2#minify-options). You may want to disable mangling or compressing for specific response (e.g. AngularJS) via this option: [example](#specify-uglifyjs-options).

- `response.minifyOptions.css`: `Object`

  Set [clean-css constructor options](https://github.com/jakubpawlowicz/clean-css#constructor-options).

- `response.minifyOptions.sass`: `Object`

  Set [node-sass render options](https://github.com/sass/node-sass#options).

- `response.minifyOptions.less`: `Object`

  Set [less render options](http://lesscss.org/#using-less-configuration).

# Examples

## Enable File Cache

By default, express-minify uses memory cache. You can change to file cache:

```javascript
app.use(minify({cache: __dirname + '/cache'}));
```

## Compile and Minify CoffeeScript/LESS/SASS/Stylus

express-minify can automatically compile your files and minify it without the need of specifying a source file directory. Currently it supports CoffeeScript, SASS, LESS and Stylus.

To enable this feature, first of all you need to install those modules by yourself:

```bash
# You needn't install all of these. Only choose what you need.
npm install coffee-script less node-sass stylus --save
```

Then you need to define MIME for those files:

```javascript
// visit http://localhost/test.coffee

express.static.mime.define(
{
  'text/coffeescript':  ['coffee'],
  'text/less':          ['less'],
  'text/x-scss':        ['scss'],
  'text/stylus':        ['styl']
});

app.use(minify());
```

## Customize Error Behavior

Errors may thrown at the compiling stage (for CoffeeScript/LESS/SASS/Stylus) or at the minifying stage (for JSON/UglifyJS/CleanCSS). The default behavior is returning the error message for compiling errors and returning original content for minifying errors.

You can customize this behavior or get notified about the error by providing `errorHandler` in options:

```javascript
var minify = require('express-minify');

var myErrorHandler = function (errorInfo, callback) {
  console.log(errorInfo);
  // below is the default implementation (minify.Minifier.defaultErrorHandler)
  if (errorInfo.stage === 'compile') {
    callback(errorInfo.error, JSON.stringify(errorInfo.error));
    return;
  }
  callback(errorInfo.error, errorInfo.body);
};

app.use(minify({ errorHandler: myErrorHandler }));
```

The structure of `errorInfo` is:

- `stage`: One of `["compile", "minify"]`

  The stage when error is thrown.

- `body`: `String`

  The content to compile or minify, which causes the error of course.
  If there are errors when minifying the compiled source, `body` will be the compiled source.

- `assetType`: One of `["js", "css", "json", "coffee", "sass", "less", "stylus"]`

  The type of the original content.

- `options`: `Object`

  The options you supplied via `response.minifyOptions`.

- `error`: `Error`

  The error thrown by the corresponding processor.

## Use Uglify-ES

You can pass the [uglify-es](https://www.npmjs.com/package/uglify-es) module in options to replace the built-in UglifyJS 3 module.

```javascript
var uglifyEs = require('uglify-es');
app.use(minify({
  uglifyJsModule: uglifyEs,
}));
```

Remember to invalidate file caches after switching a UglifyJS module. They won't be invalidated automatically.

## Specify UglifyJS Options

### Example 1: Disable Mangling for AngularJS Source Files

```javascript
app.use(function(req, res, next)
{
  // do not mangle -angular.js files
  if (/-angular\.js$/.test(req.url)) {
    res.minifyOptions = res.minifyOptions || {};
    res.minifyOptions.js = { mangle: true };
  }
  next();
});
app.use(minify());
```

### Example 2: Preserve Comments for Specific JavaScript Files

```javascript
app.use(function(req, res, next)
{
  if (/\.(user|meta)\.js$/.test(req.url)) {
    res.minifyOptions = res.minifyOptions || {};
    res.minifyOptions.js = { output: { comments: true } };
  }
  next();
});
```

## Dynamic Response

express-minify is able to handle all kind of responses, including dynamic responses.

```javascript
var responseJS =
  "(function(window, undefined)\n" +
  "{\n" +
  "\n" +
  "    var hello = 'hello';\n" +
  "\n" +
  "    var world = 'world';\n" +
  "\n" +
  "    alert(hello + world);\n" +
  "\n" +
  "})(window);"
app.use(minify());
app.get('/response.js', function(req, res)
{
  res.setHeader('Content-Type', 'application/javascript');
  res.end(responseJS);
});
```

## Disable Minifying or Caching for Specific Response

If you don't want to minify a specific response, just set `response.minifyOptions.minify = false`.

If you want to minify a response but don't want to cache it (for example, dynamic response data), set `response.minifyOptions.cache = false`.

### Example 1. Disable Minification for Minified Assets

```javascript
app.use(function(req, res, next)
{
  if (/\.min\.(css|js)$/.test(req.url)) {
    res.minifyOptions = res.minifyOptions || {};
    res.minifyOptions.minify = false;
  }
  next();
});
app.use(minify());
```

### Example 2. Disable Caching for Dynamic Content

```javascript
app.use(minify());
app.get('/server_time_min.jsonp', function(req, res)
{
  var obj = {
    'ok': true,
    'data': {
      'timestamp': new Date().getTime(),
    },
  };

  // minify this response, but do not cache it
  res.minifyOptions = res.minifyOptions || {};
  res.minifyOptions.cache = false;
  res.setHeader('Content-Type', 'application/javascript');
  res.send("callback(" + JSON.stringify(obj, null, 4) + ");");
});

app.get('/server_time.jsonp', function(req, res)
{
  var obj = {
    'ok': true,
    'data': {
      'timestamp': new Date().getTime(),
    },
  };

  // do not minify (and do not cache) this response
  res.minifyOptions = res.minifyOptions || {};
  res.minifyOptions.minify = false;
  res.setHeader('Content-Type', 'application/javascript');
  res.send("callback(" + JSON.stringify(obj, null, 4) + ");");
});
```

# Change Log

1.0.0

- Replace cssmin with [clean-css](https://github.com/jakubpawlowicz/clean-css)
- Upgrade to use Uglify-JS 3 API
- Support options for CSS minifying
- Support options for SASS and LESS compiling
- Refine naming conversion
- Minimum required NodeJs version changed to `4.0.0` for `Object.assign`

0.2.0

- Support `onerror`
- Minimum required NodeJs version changed to `0.12.0` for `fs.access`

0.1.7

- Support customizing UglifyJS/cssmin instance

0.1.6

- Make `node-sass`, `stylus`, `less`, `coffee-script` dependency optional, now developers need to manually install those modules to enable compiling

0.1.5

- Fix MIME for Js
- Fix JSON minify performance issue

0.1.4

- Add some useful badges [#27](https://github.com/SummerWish/express-minify/pull/27)
- Update dependencies
- Support JSON minify [#25](https://github.com/SummerWish/express-minify/pull/25)
- Start to use travis-ci online build testing

0.1.3

- Update dependencies [#19](https://github.com/breeswish/express-minify/issues/19) [#20](https://github.com/breeswish/express-minify/issues/20)

0.1.2

- Added `res._skip`.
- Modified behaviour of `res._no_minify`. Now it will only disable minifying and won't cause precompiling not working. [#17](https://github.com/breeswish/express-minify/issues/17)
- Fixed cache bugs with response options.

0.1.1

- Added fallback for `res._no_mangle = true` (Please use `res._uglifyMangle = false`)
- Update dependencies

0.1.0

- Changed disabling mangle: `res._no_mangle = true` => `res._uglifyMangle = false`
- Added support for passing additional UglifyJs options: `res._uglifyCompress`, `res._uglifyOutput` [#15](https://github.com/breeswish/express-minify/issues/15)

0.0.11

- Update dependencies [#11](https://github.com/breeswish/express-minify/issues/11)

0.0.10

- Added tests

- Fixed SASS compiling

- Fixed express-compression compatibility

0.0.9

- Added support for `res._no_mangle` [#10](https://github.com/breeswish/express-minify/pull/10)

0.0.8

- Removed options of `whitelist` and `blacklist`

- Added support for `res._no_cache` [#5](https://github.com/breeswish/express-minify/issues/5)

- Node v0.10 compatible

0.0.7

- Changed `options`'s default `blacklist` to `[/\.min\.(css|js)$/]`

- Replaced `uglifycss` with `cssmin`

- Dropped support for `.sass` (https://github.com/andrew/node-sass/issues/12)

- Fixed [#3](https://github.com/breeswish/express-minify/issues/3)

0.0.6

- Support for blacklist and whitelist [#2](https://github.com/breeswish/express-minify/issues/2)

0.0.5

- Added support for `res._no_minify`

- Fixed [#1](https://github.com/breeswish/express-minify/issues/1)

0.0.4

- Support for LESS/SASS/Stylus/CoffeeScript parsing and minifying

0.0.3

- Support for file cache

- Fixed the bug of non-string path

0.0.2

- Support for dynamic minifying

# License

The MIT License (MIT)

Copyright (c) 2017 Breezewish

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
