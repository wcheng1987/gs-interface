var db = require('./db.js');
var EventProxy = require("eventproxy").EventProxy;
var env = require('env.json');
var audioPaper = require('./audioPaper.js');

var insertOne = function(errorWriteRecord, cb) {
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
        ep.after('item', errorWriteRecord.item.length, cb);
        
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
                ep.trigger('item', item);
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