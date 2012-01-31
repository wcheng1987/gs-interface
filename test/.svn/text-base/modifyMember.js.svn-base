var db = require('./db.js');
var querystring = require('querystring');
var crypto=require('crypto');

var Md5=function(str) {
        return crypto.createHash('md5').update(str).digest('hex');
}

exports.modify=function(request,body,cb){
         var result = {status:500, headers: {'Content-Type': 'text/plain; charset=utf-8'},
                                   reson:"Internal Server Error",body:""};
         var o=JSON.parse(body);
         console.log(o);
         var options = {
                table: "gs_member",
                fields:o,
                where:"_id="+request.session.user._id
         }
         db.update(options,function(rsp){
                          result.status=200;
                          result.reson='OK';
                          cb(result);
         });
}

exports.changePW=function(request,cb){
         var result = {status:500, headers: {'Content-Type': 'text/plain; charset=utf-8'},
                                   reson:"Internal Server Error",body:""};
         var options = {
                table: "gs_member",
                fields:{
                        password:Md5(request.body.password)
                },
                where:"_id="+request.session.user._id
         }
         db.update(options,function(rsp){
                          result.status=200;
                          result.reson='OK';
                          cb(result);
         });
}

