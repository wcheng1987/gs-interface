var request = require('./support/http');
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
exports.getNow=function(){
        var now = new Date();
        var year = now.getFullYear();
        return (year+'-'+(now.getMonth()+1)+'-'+now.getDate()+' '+
        now.getHours()+':'+now.getMinutes()+':'+now.getSeconds());
}
