var mail = require('nodemailer');
var db = require('./db.js');
var crypto = require('crypto');
var sui = require('./sui.js');

var Md5=function(str) {
        return crypto.createHash('md5').update(str).digest('hex');
}

exports.email=function(request,body,cb){
        var result = {status:500, headers: {'Content-Type': 'text/plain; charset=utf-8'},
                                  reson:"Internal Server Error",body:""};
        //console.log(JSON.stringify(body));
        //console.log("bbbb");
        //console.log(body);
        console.log("xxxx2");
        console.log(request.body);
        var o=JSON.parse(body);
        var options = {
                table: "gs_member",
                column:"_id,email",
                fields:{
                        //username:'189',
                        state:1
                }
         }
         var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
         var pattern=/^([0-9]{11})$/;
         if(myreg.test(o.identification.username)){
                options.fields.username=o.identification.username;
         }
         if(pattern.test(o.identification.username)){
                options.fields.username=o.identification.username;
         }
         if(options.fields.username){
                 db.select1(options,function(rsp){
                       if(rsp.length===0){
                              result.status=400;
                              delete result.reson;
                              cb(result);
                       }
                       else{
                            if(rsp[0].email){
                                 var pass=sui.random();
                                 var password=Md5(pass);
                                 var opt={
                                          table: "gs_member",
                                          fields:{
                                                  password:password
                                          },
                                          where:"_id="+rsp[0]._id
                                 }
                                 db.update(opt,function(){
                                           var url="http://192.168.0.115:1340/api/member/forgot/password?login_id="+rsp[0]._id+"&verifystr="+password;
		                           mail.SMTP = {
			                        use_authentication : true,
			                        host : 'smtp.163.com',
			                        port : 25,
			                        ssl : false,
			                        user : 'xiaoyuanxiushenlu@163.com',
			                        pass : 'qw12er34'
		                           }

		                           mail.send_mail({
			                        sender : 'xiaoyuanxiushenlu@163.com',
			                        to :rsp[0].email,
			                        subject : '随便把',
			                        body : 'Hello',
                                                html : '<p><b>请点击下面链接，成功后请立即修改密码</b>'+url+'</p>'
		                           }, function(error, success) {
			                               if(!error) {
				                           console.log('message success');
				                           result.status=200;
                                                           result.reson='OK';
                                                           cb(result);
			                               } else {
				                           console.log('failed' + error);
				                           cb(result);
			                               }
		                           });
		                 });
                            }
                           //手机忘记密码
                            else{
                                 result.status=200;
                                 cb(result);
                            }
                       }
	         });
         }
         else{
                 result.status=400;
                 cb(result);
         }                
}


