var db = require('./db.js');
var crypto = require('crypto');

var Md5=function(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

var getNow=function(){
        var now = new Date();
        var year = now.getFullYear();
        return (year+'-'+(now.getMonth()+1)+'-'+now.getDate()+' '+
        now.getHours()+':'+now.getMinutes()+':'+now.getSeconds());
}

exports.add = function(req, res) {
    console.log("==add new member==");
    var reg = req.body.register;
    var sql = "SELECT _id  FROM `gs_member` WHERE `username` = '"+
                reg.username+"'";
    if(reg.email)
        sql += " OR email = '"+reg.email+"'";
    else if(reg.phone)
        sql += " OR phone = "+reg.email;
    
    db.query(sql, function(err, rs) {
        if(db.errorHandle(err, rs, function(result) {
            if(result.status != 204) res.send(result.status);
            reg.regtime = getNow();
            reg.state = 1;
            reg.type = 1;
            options={
                table: "gs_member",
                fields:reg
            }                             
            db.insert(options,function(gid){
                reg._id = gid;
                req.session.member = reg;
                var json = {member:{_id:gid, username:reg.username}};
                res.json(json, 201);
            });
        }))
        {
            console.log(rs);
            res.send(409);//user had exist
        }
    });
}

exports.query = function(req, res) {
    console.log("query member id="+req.params.id);
    var json = {member:req.session.member};
    res.json(json);
}

exports.update = function(req, res) {
    console.log("update member id="+req.params.id);
    //for test
//    req.session.member = req.session.member || {_id:619};

    //check database first for valid info
    //....
        
    var opt = {
        table:"gs_member"
        ,fields:req.body.member
        ,where:"_id="+req.params.id
    }
    db.update(opt, function(err) {
        if(err) res.send(422);
        for(var k in req.body.member)
        {
            req.session.member[k] = req.body.member[k];
        }
        res.send(200);
    });
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
        if(!db.errorHandle(err, rs, function(result) {
            if(result.status == 204) result.status = 404;
            res.send(result.status);
        })) return;
        console.log("login==", rs);
        if(1 != rs[0].state) res.send(403);
        else{
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
