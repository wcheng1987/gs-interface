var url = require('url');
var qs = require('querystring');
var db = require('./db.js');

exports.select=function(request,cb){
         var uil=url.parse(request.url);
         var o=qs.parse(uil.query);
         var result = {status:500, headers: {'Content-Type': 'text/plain; charset=utf-8'},
                                   reson:"Internal Server Error",body:""};
         var obj={};
         console.log(o);
         var options = {
                table: "gs_exampaper",
                column:" _id,creator_id,locale_id,name,memo,hits,createDate,totalScore,timeLimit,appointTime,share,answerHidden,examercount ",
                fields:{
                        state:1,
                        del:0,
                        examclass_id:parseInt(o.examclass_id)
			,"appointTime!":"NULL"
                }
         }
         done=0;
         db.select1(options,function(rsp){
                    obj.examPaper=rsp;
                    for(var i=0,len=rsp.length;i<len;i++){
                            selectMem(rsp[i].creator_id,i,function(re,j){
                                  obj.examPaper[j].mem=re[0].realname;
                                  delete obj.examPaper[j].creator_id;
                                  selectLoc(rsp[j].locale_id,j,function(res,k){
                                        obj.examPaper[k].local=res[0].name;
                                        delete obj.examPaper[k].locale_id;
                                        if(++done >= len){
                                               result.status=200;
                                               result.reson='OK';
                                               result.body=JSON.stringify(obj);
                                               cb(result);
                                        }
                                  });
                            });
                    }
         });
}

var selectMem=function(id,i,cb){
         var options = {
                table: "gs_member",
                fields: {
                         _id:id
                },
                column:"realname",
                cbParam:i
         }
         db.select1(options, function(re,j) {
                cb(re,j);
         });
}

var selectLoc=function(id,i,cb){
         var options = {
                table: "gs_location",
                fields: {
                         _id:id
                },
                column:"name",
                cbParam:i
         }
         db.select1(options, function(res,k) {
                cb(res,k);
         });
}

