var crypto = require('crypto');
var onHeaders = require('on-headers');

var Factory = function (options) {
  return createMiddleware(options);
};

Factory.Cache = require('./cache.js');
Factory.Minifier = require('./minifier.js');

module.exports = Factory;

var createMiddleware = function expressMinify(opt) {
  var options = Object.assign({
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
  }, opt);

  var cache = new Factory.Cache(options.cache);
  var minifier = new Factory.Minifier(options);

  return function express_minify_middleware(req, res, next) {
    var write = res.write;
    var end = res.end;

    var buf = null;
    var type = 'plain';

    onHeaders(res, function () {
      if (req.method === 'HEAD') {
        return;
      }
      if (res.minifyOptions && res.minifyOptions.enabled === false) {
        return;
      }
      var contentType = res.getHeader('Content-Type');
      if (contentType === undefined) {
        return;
      }

      // for sass, less, stylus, coffee module:
      //    null: module is found but not loaded
      //    false: module not found
      // so we should not process false values, but allow null values
      if (minifier.sassModule !== false && options.sassMatch && options.sassMatch.test(contentType)) {
        type = 'sass';
        res.setHeader('Content-Type', 'text/css');
      } else if (minifier.lessModule !== false && options.lessMatch && options.lessMatch.test(contentType)) {
        type = 'less';
        res.setHeader('Content-Type', 'text/css');
      } else if (minifier.stylusModule !== false && options.stylusMatch && options.stylusMatch.test(contentType)) {
        type = 'stylus';
        res.setHeader('Content-Type', 'text/css');
      } else if (minifier.coffeeModule !== false && options.coffeeScriptMatch && options.coffeeScriptMatch.test(contentType)) {
        type = 'coffee';
        res.setHeader('Content-Type', 'text/javascript');
      } else if (options.jsonMatch && options.jsonMatch.test(contentType)) {
        type = 'json';
      } else if (options.jsMatch && options.jsMatch.test(contentType)) {
        type = 'js';
      } else if (options.cssMatch && options.cssMatch.test(contentType)) {
        type = 'css';
      }

      if (type === 'plain') {
        return;
      }
      if ((type === 'js' || type === 'css') && res.minifyOptions && res.minifyOptions.minify === false) {
        return;
      }

      res.removeHeader('Content-Length');

      // prepare the buffer
      buf = [];
    });

    res.write = function (chunk, encoding) {
      if (!this._header) {
        this._implicitHeader();
      }

      if (buf === null) {
        return write.call(this, chunk, encoding);
      }

      if (!this._hasBody) {
        return true;
      }

      if (typeof chunk !== 'string' && !Buffer.isBuffer(chunk)) {
        throw new TypeError('first argument must be a string or Buffer');
      }

      if (chunk.length === 0) {
        return true;
      }

      // no chunked_encoding here
      if (typeof chunk === 'string') {
        chunk = new Buffer(chunk, encoding);
      }

      buf.push(chunk);
    };

    res.end = function (data, encoding) {
      if (this.finished) {
        return false;
      }

      if (!this._header) {
        this._implicitHeader();
      }

      if (data && !this._hasBody) {
        data = false;
      }

      if (buf === null) {
        return end.call(this, data, encoding);
      }

      if (data) {
        this.write(data, encoding);
      }

      var buffer = Buffer.concat(buf);
      var minifyOptions = Object.assign({}, this.minifyOptions);
      var cacheKey = crypto.createHash('sha256').update(JSON.stringify(minifyOptions) + buffer).digest('hex').toString();
      var self = this;

      cache.layer.get(cacheKey, function (err, minized) {
        if (err) {
          // cache miss
          minifier.compileAndMinify(type, minifyOptions, buffer.toString(encoding), function (err, minized) {
            if (minifyOptions.cache === false || err) {
              // do not cache the response body
              write.call(self, minized, 'utf8');
              end.call(self);
            } else {
              cache.layer.put(cacheKey, minized, function () {
                write.call(self, minized, 'utf8');
                end.call(self);
              });
            }
          });
        } else {
          // cache hit
          write.call(self, minized, 'utf8');
          end.call(self);
        }
      });
    };

    next();
  };
};
