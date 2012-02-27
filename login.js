var db = require('./db.js');
var crypto = require('crypto');

var errorHandle = function(err, rs, cb) {
	var ret = true;
	if(err) {
		console.log(err.stack);
		cb({status:500});
		ret = false;
	}
	else if(rs.length == 0 && !rs.allowNull) {
		console.log("can not find record");
		cb({status:404});
		ret = false;
	}	
	return ret;
}

var Md5=function(str) {
        return crypto.createHash('md5').update(str).digest('hex');
}

var getNow=function(){
        var now = new Date();
        var year = now.getFullYear();
        return (year+'-'+(now.getMonth()+1)+'-'+now.getDate()+' '+
        now.getHours()+':'+now.getMinutes()+':'+now.getSeconds());
}

var syncRecord = function() {

}

exports.login=function(req, res){
    var id = req.body.identification;
    var sql = "select * from gs_member where "
    if(id.username.search("@") >= 0)
        sql += "email = '"+id.username+"'"
    else if(!isNaN(parseInt(id.username)))
        sql += "phone = "+parseInt(id.username);
    else
        sql += "username = '"+id.username+"'"
          
    db.query(sql,function(err, rs){
            if(!errorHandle(err, rs, function(result) {
                if(result) res.send(result.status);
            })) return;
            console.log("login==", rs);
            if(1 != rs[0].state) res.send(403);
            else{
                //var md5Password=Md5(req.body.identification.password);
                if(req.body.identification.password === rs[0].password){
                    var op={
                        table: "gs_member",
                        fields:{lastlogintime:getNow()},
                        where:"_id="+rs[0]._id
                    }
                    db.update(op,function(){
                        delete rs[0].password; 
                        req.session.member = rs[0];
                        var json = {
                            member:{
                                _id:rs[0]._id
                                ,username:rs[0].username
                            }
                        }
                        res.json(json);
                    });
                }
                else{
                    res.send(401);
                }
            }
    });
}
