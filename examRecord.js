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

//add option records of item records
var addItemOptionRecord = function(gid, ir, cb)
{
    console.log("addItemOptionRecord");
    var sql = "SELECT *  FROM `gs_examoption` WHERE `item_id` = "+ir.item_id
    db.query(sql, function(err, rs) {
        if(!errorHandle(err, rs, cb)) return;
        console.log(rs);
        var opt = {table:'gs_examoptionanswer'};
        var done = 0;
        for(var k = 0, len = ir.answers.length; k < len; k++) {
            var answer = ir.answers[k];
            opt.fields = {
                item_id: gid
                ,rightanswer: rs[k].rightanswer
                ,answer:answer
            }
            if(typeof answer == 'string') {
                opt.fields.option_id = rs[k]._id;
            }
            else if(typeof answer == 'number') {
                opt.fields.option_id = rs[answer-1]._id;
            }
            db.insert(opt, function() {
                if(++done == len) cb({status:201});
            });
            
        }
    });

}

//add item records of this exam into itemAnswer 
var addItemRecord = function(gid, itemRecords, cb) {
    console.log("addItemRecord");
	var opt = { table:'gs_examitemanswer'},
    done = 0;
	for(var k = 0, len = itemRecords.length; k < len; k++) {
		console.log("k=",k);
		(function () {
			var ir = itemRecords[k];
			ir.parent_id = gid;
			//console.log(ir);
			opt.fields = ir; 
			db.insert(opt, function() {
                if(ir.answers) //multi-choose and blank
                {
                    addItemOptionRecord(gid, ir, function(result) {
                        if(result.status >= 300 || ++done == len) cb(result);
                    });
                }
                else if(ir.itemRecord) //multi-stem
                {
                    addItemRecord(gid, ir.itemRecord, function(result) {
                        if(result.status >= 300 || ++done == len) cb(result);
                    });
                }
                else //other
                {
                    if(++done == len) cb({status:201});
                }
            });
		}());
	}
}

//add this examination record into examinfo
var addRecord = function(record, member, cb) 
{
	var lid = record.lid;
	delete record.lid;
    record.examinee_id = member._id;
	var opt = {
		table:"gs_examinfo"
		,fields: record
	};
	db.insert(opt, function(gid) {
        bSend = false;
        addItemRecord(gid, record.itemRecord, function(result) {
            if(bSend) return;
            if(201 == result.status) result.json = {_id:gid, lid:lid};
            cb(result);
            bSend = true;
        });
	});
}

exports.add = function(req, res) {
    console.log("==add examination record==");
    addRecord(req.body, req.session.member, function(result) {
        if(201 == result) res.json(result.json, result.status);
        else res.send(result.status);
    });
}

//makeup item records 
var makeupItemRecord = function(ir, index, arr)
{
    var hasOption = (!ir.answer && !ir.textanswer && 6!=ir.type);
    if(!ir.answer) delete ir.answer;
    if(!ir.textanswer) delete ir.textanswer;
    if(6 == ir.type) //multi-stem
    {
        delete ir.type;
        delete ir.parent_id;
        delete ir.record_id;
        this.cbDone(200);
        return;
    }
    
    var handleMultiStemQuestion = function(question) {
        if(question.parent_id) //multi-stem question
        {
            arr.some(function(e) {
                if(e.item_id == question.parent_id)
                {
                    e.itemRecord = e.itemRecord || [];
                    delete question.parent_id;
                    e.itemRecord.push(question);
                    return true;
                }
            });
            delete arr[index];
        }
        else
        {
            delete question.parent_id;
        }
    };
    
    if(hasOption)
    {
        var kThis = this;
        var sql = "SELECT answer FROM `gs_examoptionanswer` WHERE "+
                   "`item_id` = "+ir.record_id+" AND `option_id` IN "+
                   "(SELECT _id FROM `gs_examoption` WHERE `item_id` = "+
                   ir.item_id+")";
        db.query(sql, function(err, rs) {
            if(err) kThis.cbDone(500);
            else
            {
                ir.answers = [];
                rs.forEach(function(e) {
                    if(2 == ir.type)
                        ir.answers.push(parseInt(e.answer));
                    else
                        ir.answers.push(e.answer);
                });
                delete ir.type;
                handleMultiStemQuestion(ir);
                kThis.cbDone(200);
            }
        });
        delete ir.record_id;
    }
    else
    {
        delete ir.record_id;
        delete ir.type;
        handleMultiStemQuestion(ir);
        this.cbDone(200);
    }
}

//makeup record
var makeupRecord = function(record)
{
    var sql = "SELECT t1.item_id, t1.parent_id as record_id, t1.answer,"+
                " t1.textanswer, t1.score, t2.type, t2.parent_id "+
                "FROM `gs_examitemanswer` as t1, `gs_examitem` as t2 "+
                "WHERE t2._id = t1.item_id AND t1.`parent_id` = "+record._id;
    var kThis = this;
    db.query(sql, function(err, rs) {
        if(!err) 
        {
            var acb = new ArrayCB(rs.length, 200, function(status) {
                if(200 == status) {
                    //To remove null object in rs
                    record.itemRecord = [];
                    rs.forEach(function(e) {record.itemRecord.push(e);});
                }
                kThis.cbDone(status);
            });
            rs.forEach(makeupItemRecord, acb);
        }
        else
        {
            kThis.cbDone(500);
        }
    });
}

//query records 
var queryRecords = function(sql, cb)
{
    console.log("==queryRecords==");
    db.query(sql, function(err, rs) {
        if(db.errorHandle(err, rs, function(result) {
            if(result.status == 404) result.status = 204;
            cb(result);
        }))
        {
            var acb = new ArrayCB(rs.length, 200, function(status) {
                var result = {status:status};
                if(200 == status) result.json = rs;
                cb(result);
            });
            rs.forEach(makeupRecord, acb);
        }
    });
}

var addRecords = function(records, member, cb) {
    if(records && records.length > 0)
    {
        var acb = new ArrayCB(records.length, 201, function(status) {
            var result = {status:status};
            if(201 == status) result.json = acb.commitReceipt;
            cb(result);
        });
        acb.commitReceipt = [];
        records.forEach(function(record) {
            var kThis = this;//The "this" is acb. 
            addRecord(record, member, function(result) {
                if(201 == result.status) {
                    kThis.commitReceipt.push(result.json);
                }
                kThis.cbDone(result.status);
            });
        }, acb);
    }
    else
    {
        cb({status:204});
    }
}

//sync the examination records
exports.sync = function(req, res) {
    console.log("==sync examination record==");
    //just for test
    //req.session.member = {_id:42};

    var json = {};
    var commited = req.body.commited;
    var records = req.body.uncommit;

    //query exist record which on server only and response them
    var sql = "SELECT * FROM `gs_examinfo` WHERE examinee_id = "+
                req.session.member._id;
    if(0 < commited.length)
    {
        sql += " AND _id NOT IN ("+commited+")";
    }
    var origin = req.query.start || 1
        ,range = req.query.end || 100;
    if(origin > 0) origin--;
    range -= origin;
    sql += " LIMIT "+origin+" , "+range;
    
    queryRecords(sql, function(result) {
        var statusQuery = result.status;

        if(200 == result.status) json.examRecord = result.json;

        addRecords(records, req.session.member, function(result) {
            if(201 == result.status) json.commitReceipt = result.json;

            if( statusQuery >=300 && result.status >= 300) 
                res.send(result.status);
            else if(statusQuery < 300 && result.status < 300) res.json(json); 
            else res.json(json, 206);
        });
    });
}

