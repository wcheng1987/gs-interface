var url = require('url');
var qs = require('querystring');
var db = require('./db.js');
var env = require('env.json');

exports.list = function(req, res) {
    console.log("==news list from "+req.query.start+" To "+req.query.end);
    
    var sql = "SELECT t1.`_id` , t1.`title` , t1.`modifytime` , t2.`username` ,"+
        "t1.`imageurl` FROM  `gs_news` AS t1,  `gs_member` AS t2 "+
        "WHERE t1.`modifyuser` = t2.`_id` ORDER BY t1.`modifytime` DESC ";
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
        if(db.errorHandle(err, rs, function(result) {
            res.send(result.status);
        })) {
            rs.forEach(function(news) {
                if(news.imageurl) {
                    news.imageurl = env.imageBaseURL+news.imageurl;
                }
            });
            json.news = rs;
            res.json(json);
        }
    })
}

exports.query = function(req, res) {
    console.log("==The news NO."+req.params.id+" will be query");
    
    var sql = "SELECT t1.`_id` , t1.`title` , t1.`content` , t1.`createtime`, "+
        "t1.`modifytime` , t2.`username` AS createuser, "+
        "t3.`username` AS modifyuser, t1.`imageurl` "+
        "FROM  `gs_news` AS t1,  `gs_member` AS t2,  `gs_member` AS t3 "+
        "WHERE t1.`createuser`= t2.`_id` AND t1.`modifyuser` = t3.`_id` AND "+
        "t1.`_id` = "+req.params.id;
    
    db.query(sql, function(err, rs) {
        if(db.errorHandle(err, rs, function(result) {
            res.send(result.status);
        })) {
            var news = rs[0]
            if(news.imageurl) {
                news.imageurl = env.imageBaseURL+news.imageurl;
            }
            res.json(news);
        }
    })
}
