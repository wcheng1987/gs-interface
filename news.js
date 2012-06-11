var db = require('./db.js');
var env = require('env.json');

exports.list = function(req, res) {
    console.log("==news list from "+req.query.start+" To "+req.query.end);
    
    var sql = "SELECT t1.`_id`, t1.`title`, t1.`createtime`, t1.`createuser`, "+
              "t2.`NAME` as username, t2.`usersimage` as userimage, t1.`imageurl` "+
              "FROM `gs_news` as t1, `users` as t2 "+
              "WHERE  t1.`examclass_id`=3 AND t1.`createuser`=t2.`ID` "+
              "ORDER BY t1.`createtime` DESC";
    var origin = req.query.start || 1
    ,range = req.query.end || 5;

    var json = {
          start: origin
        , end: range
    }

    if(origin > 0) origin--;
    range -= origin;
    sql += " LIMIT "+origin+" , "+range;
    
    
    db.query(sql, function(err, rs) {
        if(db.errorHandle(err, rs, function(result){res.send(result.status);})) {
            rs.forEach(function(news) {
                if(news.imageurl) {
                    news.imageurl = env.imageBaseURL+news.imageurl;
                }
                if(news.userimage) {
                    news.userimage = env.imageBaseURL+news.userimage;
                }
            });
            json.news = rs;
            res.json(json);
        }
    })
}

exports.query = function(req, res) {
    console.log("==The news NO."+req.params.id+" will be query");
    
    var sql = "SELECT `_id` , `content` FROM  `gs_news` "+
              "WHERE `_id` = "+req.params.id;
    
    db.query(sql, function(err, rs) {
        if(db.errorHandle(err, rs, function(result) {res.send(result.status);})) {
            var news = rs[0]
            res.json(news);
        }
    })
}
