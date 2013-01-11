var request = require('./http');
var crypto = require('crypto');

module.exports = Session;

function Session() {
	this.sid = ''
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

var sessionDone = function(res, self, done) {
  res.headers.should.have.property('set-cookie')
	self.sid = res.headers['set-cookie'][0].split(';')[0]
	if(done) done(res)
}

Session.prototype.post = function(url, data, done) {
	var self = this;
  return request()
	.post(url)
  .set('content-type', 'application/json')
  .set('Cookie', this.sid)
  .write(JSON.stringify(data))
	.end(function(res){
		sessionDone(res, self, done)
	})
}

Session.prototype.get = function(url, done) {
	var self = this;
  return  request()
	.get(url)
	.set('Cookie', this.sid)
	.end(function(res){
		sessionDone(res, self, done)
	})
}

Session.prototype.put = function(url, data, done) {
	var self = this;
  return  request()
	.put(url)
	.set('content-type', 'application/json')
	.set('Cookie', this.sid)
	.write(JSON.stringify(data))
	.end(function(res){
		sessionDone(res, self, done)
	})
}

// Session.prototype.update = function(id, data, sid) { return  putData('/members/'+id, data, sid); }
// Session.prototype.query = function(id, sid) {return getData('/members/'+id, sid);}


