var db = require('./db.js');

exports.query = function(req, res) {
    console.log("==query exampapers=="+req.query.examsubject_id);
    var sql = "SELECT t1.`_id`, t1.`name`, t1.`memo`, t1.`hits`, "+
        "t1.`createDate`, t1.`totalScore`, t1.`timeLimit`, t1.`appointTime`, "+
        "t1.`share`, t1.`answerHidden`, t2.realname AS creator, t1.`locale_id`, t1.`examdate`"+
        "FROM `gs_exampaper` AS t1, `gs_member` AS t2 "+
        "WHERE t1.creator_id = t2._id AND t1.state=0 AND t1.appointTime IS NOT NULL ";
    if(!req.query || !req.query.examsubject_id)
        return res.send(400);
    sql += "AND t1.examsubjects_id="+req.query.examsubject_id;
    
    db.query(sql, function(err, rs) {
        if(db.errorHandle(err, rs, function(result) {res.send(result.status);})) {
            res.json({examPaper:rs});
        }
    });
}

