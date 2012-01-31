var db = require('./db.js');

exports.select=function(request,cb){
         var result = {status:500, headers: {'Content-Type': 'text/plain; charset=utf-8'},
                                   reson:"Internal Server Error",body:""};
         var id=parseInt(request.params.id);
         console.log(id);
         var obj={};
         var options = {
                table: "examitemtype",
                column:"_id,title,type",
                fields:{
                         exa_id:id
                }
         },
         done=0;
         db.select1(options,function(rsp){
                    obj.examItemType=rsp;
                    for(var i=0,len=rsp.length;i<len;i++){
                            if(rsp[i].type!==6){
                                  selectItem(rsp[i],i,function(re,j){
                                        console.log('gb1:',done,len);
                                        console.log(re);
                                        console.log(j);

                                        obj.examItemType[j].examItem=re;
                                        delete obj.examItemType[j]._id;
                                        if(++done >= len){
                                             result.status=200;
                                             result.reson='OK';
                                             result.body=JSON.stringify(obj);
                                             console.log(result);
                                             cb(result);
                                        }
                                  });
                            }                                        
                            else{
                                  selectItem1(rsp[i],i,function(res,k){
                                        obj.examItemType[k].examItem=res;
                                        delete obj.examItemType[k]._id;
                                        if(++done >= len){
                                             result.status=200;
                                             result.reson='OK';
                                             result.body=JSON.stringify(obj);
                                             cb(result);
                                        }
                                  });
                            }
                    }
         });
}

var selectItem=function(obj,i,cb){
         var o;
         console.log(obj);
         console.log("aaaaaaa",obj.type);
         if(obj.type===1||obj.type===3)
                o="_id,type,content,answer,analysis,score,number";
         else{ 
                o="_id,type,content,analysis,score,number";
         }
         var options = {
                table: "examitem",
                fields: {
                         exa_id:obj._id
                },
                column:o,
                cbParam:i
         }
         db.select1(options, function(re,j) {
                console.log(j);
                var dome=0;
                for(var a=0,lem=re.length;a<lem;a++){
                        console.log("题目",a);
                        var param={
                                   par1:j,
                                   par2:a
                        }
                        selectOption1(re[a],param,function(res,par){
                              console.log('gb2',dome, lem, par);
                              if(res)
                                  re[par.par2].option=res;
                              if(++dome >= lem){
                                      console.log("okkkk",a);
                                      cb(re,par.par1);
                              }
                        });
                }
         });
}

var selectItem1=function(obj,i,cb){
         var o="_id,type,content,analysis,score,number";
         var options = {
                table: "examitem",
                fields: {
                         exa_id:obj._id,
                         content_id:"null"
                },
                column:o,
                cbParam:i
         }
         db.select1(options, function(re,j) {
                done2=0;
                for(var a=0,len1=re.length;a<len1;a++){
                        var param={
                                   par1:j,
                                   par2:a
                        }
                        selectItem2(re[a],param,function(res,p){
                              re[p.par2].question=res;
                              if(++done2 >= len1)
                                      cb(re,p.par1);
                        });
                }
         });
}

var selectItem2=function(obj,param,cb){
         if(obj.type===1||obj.type===3)
                o="_id,type,content,answer,analysis,score,number";
         else 
                o="_id,type,content,analysis,score,number";
         var options = {
                table: "examitem",
                fields: {
                         content_id:obj._id
                },
                column:o,
                cbParam:param
         }
         done1=0;
         db.select1(options, function(re,par) {
                for(var b=0,len2=re.length;b<len2;b++){
                        var pa={
                                par1:par.par1,
                                par2:par.par2,
                                par3:b
                        }
                       // selectOption(re[b],pa,function(res,p){
                        selectOption1(re[b],pa,function(res,p){
                              console.log('selectItme2',p);
                              re[p.par3].option=res;
                              if(++done1 >= len2)
                                      cb(re,p);
                        });
                }
         });
}

var selectOption1=function(obj,param,cb){
              var o;
              if(obj.type===3)
                       cb(null,param);
              else{
                   if(obj.type===2)
                       o="text,rightanswer";
                   if(obj.type===4||obj.type===5||obj.type===1)
                       o="text";
                   var options = {
                        table: "examoption",
                        fields: {
                             exa_id:obj._id
                        },
                        column:o,
                        cbParam:param
                   }
                   console.log("选项");
                   db.select1(options, function(res,par) {
                        console.log(par);
                        cb(res,par);
                   });
              }
}
/*
var selectOption=function(obj,pa,cb){
              var o;
              if(obj.type===3)
                       cb(null,pa);
              else{
                   if(obj.type===2)
                       o="text,rightanswer";
                   if(obj.type===4||obj.type===5||obj.type===1)
                       o="text";
                   var options = {
                        table: "examoption",
                        fields: {
                             exa_id:obj._id
                        },
                        column:o,
                        cbParam:pa
                   }
                   db.select1(options, function(res,p) {
                        console.log('select option',p);
                        cb(res,p);
                   });
              }
}
*/
