var mail = require('nodemailer');  
mail.SMTP = {
	use_authentication: true, 
	host: 'smtp.163.com',   
	port:25,   
	ssl:false,     
	user: 'xiaoyuanxiushenlu@163.com', 
	pass:'qw12er34'  
}
mail.send_mail(
{
	sender:'xiaoyuanxiushenlu@163.com',   
	to:'2671247381@qq.com',     
	subject:'随便把',               
	body:'Hello,这个邮件来自node.js'
},
function(error,success){
	if(!error){
		console.log('message success');
		}else{
		console.log('failed'+error);
	}
}
);
