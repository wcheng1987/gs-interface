var db = require('./db.js');

exports = module.exports = recordset;

exports.db = db;

function recordset(param) {
    return new recordSet(param);
}

function recordSet(param) {
    this.sql = param.sql;
    this.next = param.next;
    this.superObject = param.superObject;
//    this.appendSubRecord = param.appendSubRecord;
}

recordSet.prototype.appendSubRecord = function(superRecord, index, array) {}
recordSet.prototype.handleRecordset = function(superRecordset, recordSet) {
    var so = this.superObject;
    if(superRecordset) recordSet.forEach(function(record) {
        superRecordset.some(function(superRecord) {
            if(record[so.id] == superRecord._id) {
                superRecord[so.subset] = superRecord[so.subset]||[];
                superRecord[so.subset].push(record);
                return true;
            }
            else {
                return false;
            }
        })
//        superRecordset.some(appendSubRecord, record);
    });
}
recordSet.prototype.makeup = function(superRecordset, cb) {
    var kThis = this;
    db.query(this.sql, function(err, rs) {
        if(db.errorHandle(err, rs, function(result){cb(result.status)})){
            kThis.handleRecordset(superRecordset, rs);
            if(kThis.next) kThis.next.makeup(rs, cb);
            else cb(200);
        } 
    })
}

