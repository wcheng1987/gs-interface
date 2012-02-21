var db = require('./db.js');

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

