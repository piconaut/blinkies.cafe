var assert = require('assert');

/**
 * Test whether a module exists.
 * null for exists, false for not-exists.
 *
 * @param {String} name
 */
function testModule(name) {
  var module = null;
  try {
    require.resolve(name);
  } catch (ignore) {
    module = false;
  }
  return module;
}

/**
 * @typedef {{ errorHandler?: Object, uglifyJsModule?: Object }} Options
 * @param {Options} [options]
 */
function Minifier (options) {
  options = options || {};
  this.handleError = options.errorHandler || Minifier.defaultErrorHandler;
  this.uglifyJsModule = options.uglifyJsModule || testModule('uglify-js');
  this.cleanCssModule = testModule('clean-css');
  this.sassModule = testModule('node-sass');
  this.lessModule = testModule('less');
  this.stylusModule = testModule('stylus');
  this.coffeeModule = testModule('coffee-script');
  this.dispatchMap = {
    js: this._minifyJavaScript,
    css: this._minifyCss,
    json: this._minifyJson,
    sass: this._compileAndMinifySass,
    less: this._compileAndMinifyLess,
    stylus: this._compileAndMinifyStylus,
    coffee: this._compileAndMinifyCoffee,
  };
};

Minifier.defaultErrorHandler = function (errorInfo, callback) {
  if (errorInfo.stage === 'compile') {
    callback(errorInfo.error, JSON.stringify(errorInfo.error));
    return;
  }
  callback(errorInfo.error, errorInfo.body);
};

Minifier.prototype._minifyJavaScript = function (options, body, callback) {
  assert(typeof callback === 'function');
  if (!this.uglifyJsModule) {
    this.uglifyJsModule = require('uglify-js');
  }
  if (options.minify === false) {
    return callback(null, body);
  }
  var result = this.uglifyJsModule.minify(body, options.js);
  if (result.error) {
    return callback({ stage: 'minify', error: result.error, body: body }, null);
  }
  callback(null, result.code);
};

Minifier.prototype._minifyCss = function (options, body, callback) {
  assert(typeof callback === 'function');
  if (!this.cleanCssModule) {
    this.cleanCssModule = require('clean-css');
  }
  if (options.minify === false) {
    return callback(null, body);
  }
  var result = new (this.cleanCssModule)(options.css).minify(body);
  if (result.errors && result.errors.length > 0) {
    return callback({ stage: 'minify', error: result.errors, body: body }, null);
  }
  callback(null, result.styles);
};

Minifier.prototype._minifyJson = function (options, body, callback) {
  assert(typeof callback === 'function');
  if (options.minify === false) {
    return callback(null, body);
  }
  var result;
  try {
    result = JSON.stringify(JSON.parse(body));
  } catch (err) {
    return callback({ stage: 'minify', error: err, body: body }, null);
  }
  callback(null, result);
};

Minifier.prototype._compileAndMinifySass = function (options, body, callback) {
  assert(typeof callback === 'function');
  if (!this.sassModule) {
    this.sassModule = require('node-sass');
  }
  var result;
  try {
    result = this.sassModule.renderSync(Object.assign({ data: body }, options.sass)).css.toString();
  } catch (err) {
    return callback({ stage: 'compile', error: err, body: body }, null);
  }
  this._minifyCss(options, result, callback);
};

Minifier.prototype._compileAndMinifyLess = function (options, body, callback) {
  assert(typeof callback === 'function');
  if (!this.lessModule) {
    this.lessModule = require('less');
  }
  var self = this;
  this.lessModule.render(body, options.less, function (err, output) {
    if (err) {
      return callback({ stage: 'compile', error: err, body: body }, null);
    }
    self._minifyCss(options, output.css, callback);
  });
};

Minifier.prototype._compileAndMinifyStylus = function (options, body, callback) {
  assert(typeof callback === 'function');
  if (!this.stylusModule) {
    this.stylusModule = require('stylus');
  }
  var self = this;
  this.stylusModule.render(body, function (err, css) {
    if (err) {
      return callback({ stage: 'compile', error: err, body: body }, null);
    }
    self._minifyCss(options, css, callback);
  });
};

Minifier.prototype._compileAndMinifyCoffee = function (options, body, callback) {
  assert(typeof callback === 'function');
  if (!this.coffeeModule) {
    this.coffeeModule = require('coffee-script');
  }
  var result;
  try {
    result = this.coffeeModule.compile(body);
  } catch (err) {
    return callback({ stage: 'compile', error: err, body: body }, null);
  }
  this._minifyJavaScript(options, result, callback);
};

Minifier.prototype._compileAndMinify = function (assetType, options, body, callback) {
  assert(typeof callback === 'function');
  var processor = this.dispatchMap[assetType];
  if (processor !== undefined) {
    processor.call(this, options, body, callback);
  } else {
    callback(null, body);
  }
};

Minifier.prototype.compileAndMinify = function (assetType, options, body, callback) {
  assert(typeof callback === 'function');
  var self = this;
  this._compileAndMinify(assetType, options, body, function (errInfo, result) {
    if (errInfo) {
      errInfo = Object.assign({
        assetType: assetType,
        options: options,
      }, errInfo);
      self.handleError(errInfo, callback);
      return;
    }
    callback(null, result);
  });
};

module.exports = Minifier;
