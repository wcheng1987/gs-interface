var db = require('./db.js');

exports.query = function(req, res) {
    console.log("==query exampapers==");
    var sql = "SELECT t1.`_id`, t1.`name`, t1.`memo`, t1.`hits`, "+
        "t1.`createDate`, t1.`totalScore`, t1.`timeLimit`, t1.`examercount`,"+
        " t1.`share`, t1.`answerHidden`, t2.realname AS creator, "+
        "t3.name AS local FROM `gs_exampaper` AS t1, `gs_member` AS t2, "+
        "`gs_location` AS t3 WHERE t1.creator_id = t2._id AND "+
        "t1.locale_id = t3._id AND t1.state=1 AND t1.appointTime IS NOT NULL ";
    if(req.query && req.query.examclass_id)
        sql += "AND t1.examclass_id="+req.query.examclass_id;
    
    db.query(sql, function(err, rs) {
        if(db.errorHandle(err, rs, function(result) {
            res.send(result.status);
        }))
        {
            res.json({examPaper:rs});
        }
    });
}

