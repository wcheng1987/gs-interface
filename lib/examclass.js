var recordset = require('./recordset.js');

exports.getIndustry = function(req, res) {
    console.log("==getIndustry==");
    var sql = "SELECT * FROM `gs_industry`";
    recordset.db.query(sql , function(err, rs) {
        if(recordset.db.errorHandle(err, rs, function(result){res.send(result.status)})){
            var param = {
                  sql: "SELECT `_id`, `examclass_id`, `name`,`enname`,`regionlevel` AS regionLevel "+
                       "FROM `gs_examsubjects`"
                , superObject : {
                      id:"examclass_id"
                    , subset: "examSubject"
                }
            };    
            var examSubject = recordset(param);
    
            param.sql = "SELECT `_id`, `industry_id`, `name`, `enname`, `examdate` AS examDate "+
                        "FROM `gs_examclass`";
            param.next = examSubject;
            param.superObject = {
                  id:"industry_id"
                , subset:"examClass"
            };
            var examClass = recordset(param);
        
            examClass.makeup(rs, function(status) {
                if(200 == status) 
                    res.json({industry:rs}, 200);
                else
                    res.send(status);
            })
        }
    })
}
