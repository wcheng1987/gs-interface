var db = require('./db.js');
var crypto = require('crypto');

exports.add=function(request,body,cb){
         var result = {status:500, headers: {'Content-Type': 'text/plain; charset=utf-8'},
                                   reson:"Internal Server Error",body:""};
         var o=JSON.parse(body);
         var options = {
                table: "gs_member",
                column:"*",
         }
         var email;
         var phone;
         var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
         var pattern=/^([0-9]{11})$/;
         if(myreg.test(o.identification.username)){
                email=o.identification.username;
                options.where=" email='"+o.identification.username+"' or username='"+o.identification.username+"'";
         }
         if(pattern.test(o.identification.username)){
                phone=o.identification.username;
                options.where=" phone='"+o.identification.username+"' or username='"+o.identification.username+"'";
         }
         if(email||phone){
                db.select1(options,function(rsp){
                        if(rsp.length>0){
                               result.status=418;
                               result.reson='User In Use';
                               cb(result);
                        }
                        else{
                               var opt={
                                        table: "gs_member",
                                        fields:{
                                                password:Md5(o.identification.password),
                                                regtime:getNow(),
                                                state:1,
                                                type:1
                                        }
                               }
                               if(email){
                                         opt.fields.email=email;
                                         opt.fields.username=email;
                               }
                               if(phone){
                                         opt.fields.phone=phone;
                                         opt.fields.username=phone;
                               }
                               db.insert(opt,function(){
                                    result.status=200;
                                    result.reson='OK';
                                    cb(result);
                               });
                        }
                });
         }
         else{
                result.status=400;
                cb(result);
         }  
}

var Md5=function(str) {
        return crypto.createHash('md5').update(str).digest('hex');
}

var getNow=function(){
        var now = new Date();
        var year = now.getFullYear();
        return (year+'-'+(now.getMonth()+1)+'-'+now.getDate()+' '+now.getHours()+':'+now.getMinutes()+':'+now.getSeconds());
}
