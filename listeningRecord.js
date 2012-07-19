var db = require('./db.js');
var EventProxy = require("eventproxy").EventProxy;
var env = require('env.json');

exports.add = function(req, res, next) {
    var writeRecord = req.body.writeRecord;

    var opt = {
        table:'gs_writerecord',
        fields: {
            paper_id:writeRecord.paper_id,
            writer_id:req.session.member._id,
            begintime:writeRecord.beginTime,
            endtime:writeRecord.endTime,
            state:100
        }
    };
    db.insert(opt, function(gid) {
        writeRecord.gid = gid;
        
        var ep = new EventProxy();
        ep.after('item', writeRecord.item.length, insertItemDone);
        
        writeRecord.item.forEach(function(item) {
            opt.table = 'gs_writerecorditem';
            opt.fields = {
                parent_id:gid,
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
    
    var insertItemDone = function (data) {
        return res.json({writeRecord:{gid:writeRecord.gid}}, 201);
    };
};