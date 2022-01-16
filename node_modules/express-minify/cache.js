var fs = require('fs');
var path = require('path');

var FileCache = function (basePath) {
  this.basePath = basePath;
};

FileCache.prototype.get = function (hash, callback) {
  var destPath = this.basePath + hash;
  fs.readFile(destPath, {encoding: 'utf8'}, function (err, data) {
    if (err) {
      callback(err);
      return;
    }
    callback(null, data.toString());
  });
};

FileCache.prototype.put = function (hash, minized, callback) {
  var destPath = this.basePath + hash;
  var tempPath = destPath + '.tmp';
  // fix issue #3
  fs.writeFile(tempPath, minized, {encoding: 'utf8'}, function (err) {
    if (err) {
      callback(err);
      return;
    }
    fs.rename(tempPath, destPath, callback);
  });
};

var MemoryCache = function () {
  this.cache = {};
};

MemoryCache.prototype.get = function (hash, callback) {
  if (!this.cache.hasOwnProperty(hash)) {
    callback(new Error('miss'));
  } else {
    callback(null, this.cache[hash]);
  }
};

MemoryCache.prototype.put = function (hash, minized, callback) {
  this.cache[hash] = minized;
  callback();
};

/**
 * @param {String|false} cacheDirectory  false == use memory cache
 */
var Cache = function (cacheDirectory) {
  this.isFileCache = (cacheDirectory !== false);
  if (this.isFileCache) {
    // whether the directory is writeable
    cacheDirectory = path.normalize(cacheDirectory + '/').toString();
    try {
      fs.accessSync(cacheDirectory, fs.W_OK);
    } catch (ignore) {
      console.log('WARNING: express-minify cache directory is not writeable, fallback to memory cache.');
      this.isFileCache = false;
    }
  }
  if (this.isFileCache) {
    this.layer = new FileCache(cacheDirectory);
  } else {
    this.layer = new MemoryCache();
  }
};

module.exports = Cache;
