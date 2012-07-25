var db = require('./db.js');
var EventProxy = require("eventproxy").EventProxy;
var env = require('env.json');
var audioPaper = require('./audioPaper.js');

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
        ep.after('item', writeRecord.item.length, cb);
        
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
    var writeRecord = req.body.writeRecord;
    writeRecord.writer_id = req.session.member._id;
    
    insertOne(writeRecord, function(data) {
        return res.json({writeRecord:{_id:writeRecord._id}}, 201);
    });
};

exports.sync = function(req, res, next) {
    var records = req.body.uncommit||[];
    var commited = req.body.commited||[];
    var json = {};
    var commitedResp = [];
    var paperIDs = [];
    var sql = '';
    var memberID = req.session.member._id;
    
    var ep = new EventProxy();
    ep.assign('commited_resp', 'write_record', 'member', 'words_done', function(resp, wr, member, word) {
        if(word) json.word = word;
        return res.json(json);
    });
    
    var findPaper = function(ids) {
        sql = 'SELECT DISTINCT `creator_id` FROM `gs_audiopaper` WHERE `_id` IN ('+ids+')';
        db.query(sql, function(err, rs) {
            if(err) return next(err);
            var wids = [];
            ep.after('member', rs.length, function(data) {
                json.member = data;
                audioPaper.findWordByIDs(wids, ep, next);
            });
            ep.assign('word_id', function(wordIDs) {
                wids = wids.concat(wordIDs);
            });
            rs.forEach(function(member) {audioPaper.findByMember(member.creator_id, ep, next);});
        });
    };    
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
    //find all write record which client does not known
    sql = 'SELECT `paper_id`, `_id`, `begintime` AS beginTime, `endtime` AS endTime FROM `gs_writerecord` '+
          'WHERE `state` = 100 AND `writer_id` = '+memberID;
    if(commited.length > 0) sql += ' _id NOT IN ('+commited+')';
    db.query(sql, function(err, rs) {
        if(err) return next(err);
        ep.after('write_record_item', rs.length, function(data) {
            if(rs.length > 0) json.writeRecord = rs;
            console.log('write_record');
            ep.trigger('write_record', rs);
        });
        rs.forEach(findRecordItem);
        findPaper(paperIDs);
    }); 

    //insert commit new records
    ep.after('record', records.length, function() {
        if(commitedResp.length > 0) json.commitedResp = commitedResp;
        console.log('commited_resp');
        ep.trigger('commited_resp');
    });
    records.forEach(function(record) {
        paperIDsOfClient.push(record.paper_id);//find paper which client has known
        record.writeRecord.writer_id = req.session.member._id;
        insertOne(record.writeRecord, function(data) {
            commitedResp.push({lid:record.lid, _id:record.writeRecord._id});
            ep.trigger('record', record.writeRecord);
        });
    });
};