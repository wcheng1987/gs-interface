var recordset = require('./recordset.js');
/*
var makeupExamSubjects = function(examClass, cb) {
    var sql = "SELECT `_id`, `examclass_id`, `name`,`enname`,`regionlevel` "+
              "FROM `gs_examsubjects`";
    db.query(sql, function(err, rs) {
        if(db.errorHandle(err, rs, function(status){cb(status)})){
            rs.forEach(function(examSubject) {
                examClass.some(function(ec) {
                    if(examSubject.examclass_id == ec._id) {
                        ec.examSubject = ec.examSubject||[];
                        ec.examSubject.push(examSubject);
                        return true;
                    }
                    else {
                        return false;
                    }
                })
            })
            cb(200);
        }
    })
}

var makeupExamClass = function(industries, cb) {
    var sql = "SELECT * FROM `gs_examclass`";
    db.query(sql, function(err, rs) {
        if(db.errorHandle(err, rs, function(status){cb(status)})){
            rs.forEach(function(examClass) {
                industries.some(function(industry) {
                    if(examClass.industry_id == industry._id) {
                        industry.examClass = industry.examClass||[];
                        industry.examClass.push(examClass);
                        return true;
                    }
                    else {
                        return false;
                    }
                })
            })
            makeupExamSubjects(rs, cb);
        }    
    })    
}
*/
exports.getIndustry = function(req, res) {
    var sql = "SELECT * FROM `gs_industry`";
    recordset.db.query(sql , function(err, rs) {
        if(recordset.db.errorHandle(err, rs, function(status){res.send(status)})){
            var param = {
                  sql: "SELECT `_id`, `examclass_id`, `name`,`enname`,`regionlevel` "+
                       "FROM `gs_examsubjects`"
                , superObject : {
                      id:"examclass_id"
                    , subset: "examSubject"
                }
            };    
            var examSubject = recordset(param);
    
            param.sql = "SELECT * FROM `gs_examclass`";
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
