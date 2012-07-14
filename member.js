var db = require('./db.js');
var EventProxy = require("eventproxy").EventProxy;
var env = require('env.json');

var getNow=function(){
        var now = new Date();
        var year = now.getFullYear();
        return (year+'-'+(now.getMonth()+1)+'-'+now.getDate()+' '+
        now.getHours()+':'+now.getMinutes()+':'+now.getSeconds());
}

function register(req, res) {
    var reg = req.body.register;
    reg.regtime = getNow();
    reg.lastlogintime = reg.regtime;
    reg.state = 0;
    reg.type = 0;
    var options={
        table: "gs_member",
        fields:reg
    }                             
    db.insert(options,function(gid){
        reg._id = gid;
        req.session.regenerate(function() {
            req.session.member = reg;
            var json = {member:{_id:gid, username:reg.username}};
            res.json(json, 201);
        })
    })
}

exports.add = function(req, res) {
    console.log("==add new member==");
    var reg = req.body.register;
    var sql = "SELECT _id  FROM `gs_member` WHERE `username` = '"+
                reg.username+"'";
    if(reg.email)
        sql += " OR `email` = '"+reg.email+"'";
    else if(reg.phone)
        sql += " OR `phone` = "+reg.phone;
    
    db.query(sql, function(err, rs) {
        if(db.errorHandle(err, rs, function(result) {
            if(result.status != 204) res.send(result.status);
            else register(req, res);
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

    //check database first for valid info
    //....
        
    var opt = {
        table:"gs_member"
        ,fields:req.body.member
        ,where:"_id="+req.params.id
    }
    db.update(opt, function(err) {
        if(err) res.send(422);
        else {
            for(var key in req.body.member) {
                req.session.member[key] = req.body.member[key];
            }
            res.send(200);
        }
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
        if(err) return next(err);
        if(!rs.length) {
            req.body.register = req.body.identification;
            return register(req, res);
        }
        console.log("login==", rs);
        if(0 != rs[0].state) res.send(403);
        else{
            if(req.body.identification.password === rs[0].password){
                var opt={
                    table: "gs_member",
                    fields:{lastlogintime:getNow()},
                    where:"_id="+rs[0]._id
                }
                db.update(opt,function(){
                    req.session.regenerate(function() {
                        req.session.member = rs[0];
                        var json = {
                            member:{
                                _id:rs[0]._id
                                ,username:rs[0].username
                            }
                        }
                        res.json(json);
                    })
                });
            }
            else{
                res.send(401);
            }
        }
    });
}

exports.friends = function(req, res) {
    var id = req.params.id;
    var ep = new EventProxy();
    
    ep.assign('friends', 'groups', function(friends, groups) {
        friends.forEach(function(friend) {
            groups.some(function(group) {
                if(group._id == friend.group_id) {
                    delete friend.group_id;
                    if(!group.friend) group.friend = [];
                    group.friend.push(friend);
                    return true;
                }
                else return false;
            });
        });
        
        var json = {member:{_id:id, friendgroup:groups}};
        return res.json(json);
    });
    
    var sql = "SELECT `_id`,`name` FROM `gs_friendgroup` WHERE `member_id`="+id;
    db.query(sql, function(err, groups) {
        if(err) return next(err);        
        ep.trigger('groups', groups);
    });
    
    sql = "SELECT m.*,`group_id` FROM `gs_friends` AS f, `gs_member` AS m WHERE f.`member2_id`=m.`_id` AND f.`member1_id`="+id;
    db.query(sql, function(err, friends) {
        if(err) return next(err);
        ep.trigger('friends', friends);
    });
}

exports.audioPaper = function(req, res, next) {
    var id = req.params.id;
    var ep = new EventProxy();
    
    ep.assign('member', 'words', function(member, words) {
        return res.json({member:member, word:words});
    });
    
    ep.assign('site', 'audio_paper', function(sites, audioPaper) {
        audioPaper.forEach(function(ap) {
            sites.some(function(site) {
                if(site._id == ap.site_id) {
                    delete ap.site_id;
                    delete ap.src_id;
                    delete ap.creator_id;
                    if(!site.audio_paper) site.audio_paper = [];
                    site.audio_paper.push(ap);
                    return true;
                }
                else return false;
            });
        });
        ep.trigger('member', {_id:id, english_site:sites});
    });
    
    var sql = "SELECT `_id`,`begintime`,`endtime`,`replaycount`,`interval` FROM `gs_englishsite` WHERE `creator_id`="+id;
    db.query(sql, function(err, sites) {
        if(err) return next(err);        
        ep.trigger('site', sites);
    });
    
    var sql = "SELECT * FROM `gs_audiopapercopy` WHERE `creator_id`="+id;
    db.query(sql, function(err, audioPaper) {
        if(err) return next(err);        
        ep.after('word_question', audioPaper.length, function(data) {
            ep.trigger('audio_paper', audioPaper);
        });
        audioPaper.forEach(makeupAudioPaper);
    });
    
    function makeupAudioPaper(audioPaper) {
        sql = "SELECT `wordid` AS word_id, `sort` FROM `gs_audiopapercopyword` WHERE `papercopy_id` = "+audioPaper._id;
        db.query(sql, function(err, words) {
            if(err) return next(err);
            audioPaper.word_question = words
            ep.trigger('word_question', audioPaper);
        });
    }
    
    ep.assign('audio_paper', function(audioPaper) {
        var wordIDs = [0];
        audioPaper.forEach(function(ap) {
            var ids = ap.word_question.map(function(wq) {
                return wq.word_id;
            });
            wordIDs = wordIDs.concat(ids);
        });
        sql = 'SELECT DISTINCT *  FROM `gs_word` WHERE `_id` IN ('+wordIDs+')';
        db.query(sql, function(err, words) {
            if(err) return next(err);
            words.forEach(function(word) {
                word.audio = env.audioBase+word.audio;
            });
            ep.trigger('words', words);            
        });
    });
}