var db = require('./db.js');

function ArrayCB(size, OKValue, cb) {
    this.size = size;
    this.cb = cb;
    this.OK = OKValue;
}

ArrayCB.prototype.count = 0;
ArrayCB.prototype.Done = false;
ArrayCB.prototype.cbDone = function(status) {
    if(!this.Done && 
        (++this.count == this.size || this.OK != status)) {
        this.cb(status);
        this.Done = true;
    }
};

var makeupExamSubjects = function(examClass) {
    var kThis = this;
    var sql = "SELECT `_id`, `name`,`enname`,`regionlevel` "+
            "FROM `gs_examsubjects` WHERE `examclass_id`="+examClass._id;
    db.query(sql, function(err, rs) {
        if(err) {
            kThis.cbDone(500);
        }
        else {
            examClass.examSubject = rs;
            kThis.cbDone(200);
        }
    })
}

var makeupExamClass = function(industry) {
    var kThis = this;
    var sql = "SELECT * FROM `gs_examclass` WHERE `industry_id`="+industry._id;
    db.query(sql, function(err, rs) {
        if(err) {
            kThis.cbDone(500);
        }
        else {
            var acb = new ArrayCB(rs.length, 200, function(status) {
                if(200 == status) {
                    industry.examClass = rs;
                }
                kThis.cbDone(status);
            });
            rs.forEach(makeupExamSubjects, acb);
        }
    })
}

exports.getIndustry = function(req, res) {
    var sql = "SELECT * FROM `gs_industry`";
    db.query(sql , function(err, rs) {
        if(db.errorHandle(err, rs, function(status){res.send(status)})){
            var acb = new ArrayCB(rs.length, 200, function(status) {
                console.log("end gbo", status);
                if(200 == status) 
                    res.json({industry:rs}, 200);
                else
                    res.send(status);
            });
            rs.forEach(makeupExamClass, acb);
        }
    })
}

exports.select=function(request,cb){
         var result = {status:500, headers: {'Content-Type': 'text/plain; charset=utf-8'},
                                   reson:"Internal Server Error",body:""};
         var obj={};
         var options = {
                table: "gs_industry",
                column:"*"
         }
         done=0;
         db.select1(options,function(rsp){
                    obj.industry=rsp;
                    for(var i=0,len=rsp.length;i<len;i++){
                            selectExamClass(rsp[i]._id,i,function(re,j){
                                  obj.industry[j].examClass=re;
//                                  delete obj.industry[j]._id;
                                  if(++done >= len){                                   
                                       result.status=200;
                                       result.reson='OK';
                                       result.body=JSON.stringify(obj);
                                       cb(result);
                                  }
                            });
                    }
         }); 
} 

var selectExamClass=function(id,i,cb){
         var options = {
                table: "gs_examclass",
                fields: {
                         industry_id:id
                },
                column:"_id,name,enname,examdate",
                cbParam:i
         }
         db.select1(options, function(re,j) {
                cb(re,j);
         });
}

