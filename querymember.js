var db = require('./db.js');

exports.query=function(request,cb){
         var result = {status:500, headers: {'Content-Type': 'text/plain; charset=utf-8'},
                                   reson:"Internal Server Error",body:""};
         var options = {
                table: "gs_member",
                column:"username,email,realname,school,clazz,type,regtime,lastlogintime,sexy,birth,inro",
                fields:{
                        _id:request.session.user._id
                }
         }
         db.select1(options,function(rsp){
                    if(rsp.length===0){
                            result.status=400;
                            delete result.reson;
                            cb(result);
                    }
                    else{
                            result.status=200;
                            result.body=JSON.stringify(rsp[0]);
                            result.reson='OK';
                            cb(result);
                    }
         });
}

