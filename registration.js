var db = require('./db.js');
var crypto = require('crypto');

exports.add=function(request,body,cb){
         var result = {status:500, headers: {'Content-Type': 'text/plain; charset=utf-8'},
                                   reson:"Internal Server Error",body:""};
         var o=JSON.parse(body);
         var options = {
                table: "gs_member",
                column:"*",
                fields:{
                        username:o.identification.username
                }                       
         }
         db.select1(options,function(rsp){
                    if(rsp.length>0){
                            result.status=418;
                            result.reson='User In Use';
                            cb(result);
                    }
                    else{
                            options={
                                     table: "gs_member",
                                     fields:{
                                             username:o.identification.username,
                                             password:Md5(o.identification.password),
                                             regtime:getNow(),
                                             state:1,
                                             type:1
                                     }
                            }                             
                            db.insert(options,function(){
                                 result.status=200;
                                 result.reson='OK';
                                 cb(result);
                            });
                    }
         });
}

var Md5=function(str) {
        return crypto.createHash('md5').update(str).digest('hex');
}

var getNow=function(){
        var now = new Date();
        var year = now.getFullYear();
        return (year+'-'+(now.getMonth()+1)+'-'+now.getDate()+' '+now.getHours()+':'+now.getMinutes()+':'+now.getSeconds());
}
