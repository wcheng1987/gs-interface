var request = require('../support/http');
var crypto = require('crypto');

exports.MD5 = function(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

exports.getSID = function(res) {
  return res.headers['set-cookie'][0].split(';')[0];
}

function getData(url, sid) {
    return request()
           .get(url)
           .set('Cookie', sid);
}

function postData(url, data, sid) {
    return  request()
            .post(url)
            .set('content-type', 'application/json')
            .set('Cookie', sid)
            .write(JSON.stringify(data));
}

function putData(url, data, sid) {
    return  request()
            .put(url)
            .set('content-type', 'application/json')
            .set('Cookie', sid)
            .write(JSON.stringify(data));
}

exports.register = function(data) { return  postData('/members/', data, ''); }
exports.auth = function(data) { return  postData('/login', data, ''); }
exports.update = function(id, data, sid) { return  putData('/members/'+id, data, sid); }
exports.query = function(id, sid) {return getData('/members/'+id, sid);}
exports.post = postData;
exports.get = getData;
exports.put = putData;
exports.getNow=function(offset){
    var now = new Date();
    var offsetTime = offset|| 0;
    now.setTime(now.getTime()+offsetTime*1000);
    var year = now.getFullYear();
    return (year+'-'+(now.getMonth()+1)+'-'+now.getDate()+' '+
    now.getHours()+':'+now.getMinutes()+':'+now.getSeconds());
}

exports.afterLogin = function(cb) {
        exports.auth({
            identification: {
				username:"746905262@qq.com",
                password:"a85327a74b957ae06c652294934cc59a"
 				// username:"123@",
                // password:"e10adc3949ba59abbe56e057f20f883e"
                // username:"18912345678",
                // password:"e10adc3949ba59abbe56e057f20f883e"
			    // username:"gaojun",
           }
        })
        .end(function(res) {
            res.statusCode.should.equal(200);
            res.should.be.json;
            res.headers.should.have.property('set-cookie');
            res.body.should.have.property('member');
            var sid = exports.getSID(res);
            cb(sid, res.body.member);
        })
}
