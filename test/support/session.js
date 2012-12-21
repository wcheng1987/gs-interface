if (process.env.SERVER_HOST === '127.0.0.1') {
	var app = require('../..');
}

var request = require('./http');
var crypto = require('crypto');

module.exports = Session;

function Session() {
}

Session.prototype.MD5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

Session.prototype.getNow=function(offset){
  var now = new Date();
  var offsetTime = offset|| 0;
  now.setTime(now.getTime()+offsetTime*1000);
  var year = now.getFullYear();
  return (year+'-'+(now.getMonth()+1)+'-'+now.getDate()+' '+
  now.getHours()+':'+now.getMinutes()+':'+now.getSeconds());
}

var getSID = function(res) {
	return res.headers['set-cookie'][0].split(';')[0];
}

var sessionDone = function(res, self) {
  res.headers.should.have.property('set-cookie');
	self.sid = getSID(res);
}

Session.prototype.post = function(url, data, done) {
	var self = this;
  this.req = request()
	.post(url)
  .set('content-type', 'application/json')
  .set('Cookie', this.sid)
  .write(JSON.stringify(data))
	.end(function(res){
		sessionDone(res, self)
		done(res)
	});
	return this;
}

Session.prototype.get = function(url, done) {
	var self = this;
  return  request()
					.get(url)
					.set('Cookie', this.sid)
					.end(function(res){
						sessionDone(res, self)
						done(res)
					});
}

Session.prototype.put = function(url, data, done) {
	var self = this;
  return  request()
          .put(url)
          .set('content-type', 'application/json')
          .set('Cookie', this.sid)
          .write(JSON.stringify(data))
					.end(function(res){
						sessionDone(res, self)
						done(res)
					});
}

// Session.prototype.update = function(id, data, sid) { return  putData('/members/'+id, data, sid); }
// Session.prototype.query = function(id, sid) {return getData('/members/'+id, sid);}


