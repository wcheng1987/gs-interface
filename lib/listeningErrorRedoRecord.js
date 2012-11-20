var db = require('./db.js');
var EventProxy = require("eventproxy").EventProxy;

exports.insertOne = insertOne = function(errorWriteRecord, cb) {
    var opt = {
        table:'gs_errorwriterecord',
        fields: {
            record_id:errorWriteRecord.record_id,
            total:errorWriteRecord.item.length,
            begintime:errorWriteRecord.beginTime,
            endtime:errorWriteRecord.endTime,
            state:100
        }
    };
    db.insert(opt, function(_id) {
        errorWriteRecord._id = _id;
        
        var ep = new EventProxy();
        ep.after('item', errorWriteRecord.item.length, function(item_ids) {
            cb(_id);
        });
        
        errorWriteRecord.item.forEach(function(item) {
            opt.table = 'gs_errorwriterecorditem';
            opt.fields = {
                parent_id:_id,
                word_id:item.word_id,
                rightanswer:item.right,
                answer:item.answer,
                sortno:item.sort
            };
            db.insert(opt, function(item_id) {
                ep.trigger('item', item_id);
            });
        });
    });    
};

exports.add = function(req, res, next) {
    var errorWriteRecord = req.body;
    errorWriteRecord.writer_id = req.session.member._id;
    
    insertOne(errorWriteRecord, function(data) {
        return res.json({created:{_id:errorWriteRecord._id}}, 201);
    });
};

exports.insertRecords = function(records, memberID, cb) {
    var ep = new EventProxy();
    records = records ||[];
    ep.after('record', records.length, function(created) {
        cb(created);
    });
    records.forEach(function(record) {
        record.data.writer_id = memberID;
        insertOne(record.data, function(_id) {
            ep.trigger('record', {lid:record.lid, _id:_id});
        });
    });
}

exports.find = function(opt, cb, next) {
    var sql = '';
    var ep = new EventProxy();
    var paperIDs = [];

    var findRecordItem = function(record) {
        sql = 'SELECT `word_id`, `rightanswer` AS `right`, `answer`, `sortno` AS sort '+
              'FROM `gs_errorwriterecorditem` WHERE `parent_id` = '+record._id;
        db.query(sql, function(err, rs) {
            if(err) return next(err);
            record.item = rs;
            ep.trigger('error_write_record_item', rs);
        });
        //find paper that client may not know
        paperIDs.push(record.paper_id);
        delete record.paper_id;
    };    
    
    sql = 'SELECT t1.`record_id`, t1.`_id`, t1.`begintime` AS beginTime, t1.`endtime` AS endTime, t2.`paper_id` '+
          'FROM `gs_errorwriterecord` AS t1, `gs_writerecord` AS t2 '+
          'WHERE t1.`state` = 100 AND t1.`record_id` = t2.`_id` AND t2.`writer_id` ='+opt.writer_id;
    if(opt.commited && opt.commited.length > 0) sql += ' AND t1.`_id` NOT IN ('+opt.commited+')';
    db.query(sql, function(err, rs) {
        if(err) return next(err);
        ep.after('error_write_record_item', rs.length, function(data) {
            //console.log("record.paper_id:", paperIDs);
            cb(rs, paperIDs);
        });
        rs.forEach(findRecordItem);
    }); 
}