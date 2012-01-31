var db = require('./db.js');
var crypto = require('crypto');

exports.auth=function(request,body,cb){
         var result = {status:500, headers: {'Content-Type': 'text/plain; charset=utf-8'},
                                   reson:"Internal Server Error",body:""};
         var o=JSON.parse(body);
         var options = {
                table: "gs_member",
                column:" _id,username,password",
                fields:{
                        username:o.identification.username,
                        state:1
                }
         }
         db.select1(options,function(rsp){
                    if(rsp.length===0){
                            result.status=400;
                            delete result.reson;
                            cb(result);
                    }
                    else{
                            var a=Md5(o.identification.password);
                            if(a===rsp[0].password){
                                 var op={
                                        table: "gs_member",
                                        fields:{
                                                lastlogintime:getNow()
                                        },
                                        where:"_id="+rsp[0]._id
                                 }
                                 db.update(op,function(){
                                     delete rsp[0].password;
                                     result.status=200;
                                     result.reson='OK';
                                     cb(result,rsp[0]);
                                 });
                            }
                            else{
                                 result.status=400;
                                 delete result.reson;
                                 cb(result);
                            }
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

