var db = require('./db.js');
var EventProxy = require("eventproxy").EventProxy;
var audioPaper = require('./audioPaper.js');
var listeningErrorRedoRecord = require('./listeningErrorRedoRecord.js');

Array.prototype.unique = function() {
    var o = {}, i, l = this.length, r = [];
    for(i=0; i<l;i+=1) o[this[i]] = this[i];
    for(i in o) r.push(o[i]);
    return r;
};

var insertOne = function(writeRecord, cb) {
    var opt = {
        table:'gs_writerecord',
        fields: {
            paper_id:writeRecord.paper_id,
            writer_id:writeRecord.writer_id,
            begintime:writeRecord.beginTime,
            endtime:writeRecord.endTime,
            state:100
        }
    };
    db.insert(opt, function(_id) {
        writeRecord._id = _id;
        
        var ep = new EventProxy();
        ep.after('item', writeRecord.item.length, function(data){
            cb(_id);
        });
        
        writeRecord.item.forEach(function(item) {
            opt.table = 'gs_writerecorditem';
            opt.fields = {
                parent_id:_id,
                wordid:item.word_id,
                rightanswer:item.right,
                answer:item.answer,
                sortno:item.sort
            };
            db.insert(opt, function(item_id) {
                ep.trigger('item', item);
            });
        });
    });    
};

exports.add = function(req, res, next) {
    var writeRecord = req.body;
    writeRecord.writer_id = req.session.member._id;
    
    insertOne(writeRecord, function(_id) {
        return res.json({created:{_id:_id}}, 201);
    });
};

var insertRecords = function(records, memberID, cb) {
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

var find = function(opt, cb, next) {
    var sql = '';
    var ep = new EventProxy();
    var paperIDs = [];

    var findRecordItem = function(record) {
        sql = 'SELECT `wordid` AS word_id, `rightanswer` AS `right`, `answer`, `sortno` AS sort '+
              'FROM `gs_writerecorditem` WHERE `parent_id` = '+record._id;
        db.query(sql, function(err, rs) {
            if(err) return next(err);
            record.item = rs;
            ep.trigger('write_record_item', rs);
        });
        //find paper that client may not know
        paperIDs.push(record.paper_id);
    };    
    
    sql = 'SELECT `paper_id`, `writer_id`, `_id`, `begintime` AS beginTime, `endtime` AS endTime FROM `gs_writerecord` '+
          'WHERE `state` = 100 AND `writer_id` = '+opt.writer_id;
    if(opt.commited && opt.commited.length > 0) sql += ' AND `_id` NOT IN ('+opt.commited+')';
    db.query(sql, function(err, rs) {
        if(err) return next(err);
        ep.after('write_record_item', rs.length, function(data) {
            cb(rs, paperIDs);
        });
        rs.forEach(findRecordItem);
    }); 
}

exports.sync = function(req, res, next) {
    var wr = req.body.writeRecord||{};
    var ewr = req.body.errorWriteRecord||{};
    var json = {};
    var sql = '';
    var memberID = req.session.member._id;
    
    var ep = new EventProxy();
    ep.assign('write_record', 'error_write_record', 'members_done', 'words_done', function(writeRecord, errorWriteRecord, member, word) {
        if(!writeRecord && !errorWriteRecord && !member && !word) return res.send(204);
        if(writeRecord) json.writeRecord = writeRecord;
        if(errorWriteRecord) json.errorWriteRecord = errorWriteRecord;
        if(member) json.member = member;
        if(word) json.word = word;
        return res.json(json);
    });
    
    ep.assign('write_record_paperIDs', 'error_write_record_paperIDs', function(arr) {
        var ids = [];
        arr.forEach(function(pids) {
            ids = ids.concat(pids);
        });
        if(ids.length > 0) {
            audioPaper.find({query:{_id:{$in:ids}}}, function(json) {
                ep.trigger('members_done', json.member);
                ep.trigger('words_done', json.word);
            }, next);
        } else {//no paper need to be download
            ep.trigger('members_done');
            ep.trigger('words_done');
        }
        //console.log('members_done');
    });

    ep.assign('write_record_created', 'write_record_dataset', function(created, dataset) {
        var writeRecord = {};
        if(created && created.length > 0) writeRecord.created = created;
        if(dataset && dataset.length > 0) writeRecord.dataset = dataset;
        if(!writeRecord.created && !writeRecord.dataset) writeRecord = null;
        ep.trigger('write_record', writeRecord);
        //console.log('write_record');
    });
    //find all write record which client does not known
    find({writer_id:memberID, commited:wr.commited}, function(dataset, paperIDs) {
        ep.trigger('write_record_dataset', dataset);
        ep.trigger('write_record_paperIDs', paperIDs);
    }, next);
    //Insert error redo records
    insertRecords(wr.uncommit, memberID, function(created) {
        ep.trigger('write_record_created', created);
    });

    ep.assign('error_write_record_created', 'error_write_record_dataset', function(created, dataset) {
        var errorWriteRecord = {};
        if(created && created.length > 0) errorWriteRecord.created = created;
        if(dataset && dataset.length > 0) errorWriteRecord.dataset = dataset;
        if(!errorWriteRecord.created && !errorWriteRecord.dataset) errorWriteRecord = null;
        ep.trigger('error_write_record', errorWriteRecord);
        //console.log('error_write_record');
    });
    //find all error redo record which client does not known
    listeningErrorRedoRecord.find({writer_id:memberID, commited:ewr.commited}, function(dataset, paperIDs) {
        ep.trigger('error_write_record_dataset', dataset);
        ep.trigger('error_write_record_paperIDs', paperIDs);
    }, next);
    //Insert error redo records
    listeningErrorRedoRecord.insertRecords(ewr.uncommit, memberID, function(created) {
        ep.trigger('error_write_record_created', created);
    });
};