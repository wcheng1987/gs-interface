var db = require('./db.js');
var qs = require('querystring');
var url = require('url');

var getNow=function(){
        var now = new Date();
        var year = now.getFullYear();
        return (year+'-'+(now.getMonth()+1)+'-'+now.getDate()+' '+now.getHours()+':'+now.getMinutes()+':'+now.getSeconds());
}

exports.getPassWord=function(request,cb){
         var result = {status:500, headers: {'Content-Type': 'text/plain; charset=utf-8'},
                                   reson:"Internal Server Error",body:""};
         var uil=url.parse(request.url);
         var o=qs.parse(uil.query);
         var options = {
                table: "gs_member",
                column:"_id,username,password",
                fields:{
                        _id:parseInt(o.login_id),
                        password:o.verifystr,
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
                            var op={
                                  table: "gs_member",
                                  fields:{
                                      lastlogintime:getNow()
                                  },
                                  where:"_id="+o.login_id
                            }
                            db.update(op,function(){
                                  delete rsp[0].password;
                                  request.session.user=rsp[0];
                                  result.status=200;
                                  result.reson='OK';
                                  cb(result);
                            });
                    }
         });
}

