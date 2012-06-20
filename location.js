var db = require('./db.js');

exports.index = function(req, res) {
    var sql = 'SELECT * FROM `gs_location`';
    db.query(sql, function(err, rs) {
        if(db.errorHandle(err, rs, function(result) {res.send(result.status);})) {
            var locations = {location: rs};
            res.json(locations);
        }    
    });
};