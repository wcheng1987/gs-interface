
/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter
  , http = require('http');

module.exports = request;

function request(showRes) {
  return new Request(showRes);
}

function Request(showRes) {
  var self = this;
  this.data = [];
  this.header = {};
  this.basePath = '/api';
  this.addr = {
      port:1339,
      address:'127.0.0.1'
//      address:'180.96.19.107'
  };
  this.showRes = showRes || false; 
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

Request.prototype.__proto__ = EventEmitter.prototype;

var methods = ['OPTIONS', 'GET', 'POST', 'PUT', 'DELETE', 'TRACE', 'CONNECT'].map(function(method) {
    return method.toLowerCase();
});

methods.forEach(function(method) {
    Request.prototype[method] = function(path) {
        return this.request(method, path);
    };
});

Request.prototype.set = function(field, val){
  this.header[field] = val;
  return this;
};

Request.prototype.write = function(data){
  this.data.push(data);
  return this;
};

Request.prototype.request = function(method, path){
  this.method = method;
  this.path = this.basePath+path;
  return this;
};

Request.prototype.expect = function(body, fn){
  this.end(function(res){
    if ('number' == typeof body) {
      res.statusCode.should.equal(body);
    } else if (body instanceof Array) {
      res.statusCode.should.within(body[0], body[1]);
    } else if (body instanceof RegExp) {
      res.body.should.match(body);
    } else {
      res.body.should.equal(body);
    }
    fn();
  });
};

Request.prototype.end = function(fn){
    var self = this;

    var req = http.request({
        method: this.method
      , port: this.addr.port
      , host: this.addr.address
      , path: this.path
      , headers: this.header
    });

    this.data.forEach(function(chunk){
      req.write(chunk);
    });
    
    req.on('response', function(res){
      var buf = '';
      res.setEncoding('utf8');
      res.on('data', function(chunk){ buf += chunk });
      res.on('end', function(){
        if (self.showRes) console.log(buf);
        var ct = res.headers['content-type'];
        if(ct && 0 <= ct.indexOf('json')) {
          res.body = JSON.parse(buf);  
        }
        else {
          res.body = buf;
        }
        fn(res);
      });
    });

    req.end();
    
    return this;
};
