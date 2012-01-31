var db = require('./db.js');

exports.modify=function(request,body,cb){
         var result = {status:500, headers: {'Content-Type': 'text/plain; charset=utf-8'},
                                   reson:"Internal Server Error",body:""};
         var o=JSON.parse(body);
         console.log(o);
         var options = {
                table: "gs_member",
                fields:o,
                where:"_id="+request.session.user._id
         }
         db.update(options,function(rsp){
                          result.status=200;
                          result.reson='OK';
                          cb(result);
         });
}


