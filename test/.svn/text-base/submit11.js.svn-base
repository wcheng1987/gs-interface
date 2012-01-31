var db = require('./db.js');

exports.submit=function(request,body,cb){
         var result = {status:500, headers: {'Content-Type': 'text/plain; charset=utf-8'},
                                   reson:"Internal Server Error",body:""};
         var exa_id=parseInt(request.params.id);
         console.log(JSON.stringify(body));
         var o=JSON.parse(body);
         console.log(o);
         o.submit.exa_id=exa_id;
         var options = {
                table: "examinfo",                
                fields:o.submit                                     
         }
         db.insert(options,function(insertId){
         	        done=0;
         	        for(var i=0,len=o.submit.item.length;i<len;i++){
         	        	o.submit.item[i].exa_id2=insertId;        	       
         	                if(o.submit.item[i].answer||o.submit.item[i].answer===0){
         	        	     if(typeof o.submit.item[i].answer==="number"){
         	        		     var options = {
                                                   table: "examitemanswer",                
                                                   fields:o.submit.item[i]                                     
                                             }
                                             db.insert(options,function(){
                                                  if(++done>=len){
                                                       result.status=200;
                                                       result.reson='OK';
                                                       cb(result);
                                                  }
                                             });         	        		
         	        	     }
         	        	     else{
                                          if(typeof o.submit.item[i].answer==="string"){
                                                var op={
                                                        table: "examitemanswer",
                                                        fields:{
                                                                exa_id2:insertId,
                                                                exa_id:o.submit.item[i].exa_id
                                                        },
                                                        cbParam:o.submit.item[i].answer                                                        
                                                }
                                                db.insert(op,function(opid,answer){
                                                     var b={};                
         	        	     	             var a=answer.split(",");
         	        	     	             for(var j=0,lem=a.length;j<lem;j++){
         	        	     		           b.exa_id2=a[j]-1;
         	        	     		           b.exa_id=opid;
         	        	     		           b.answer=a[j];
         	        	     		           var options = {
                                                                 table: "examoptionanswer",                
                                                                 fields:b                                     
                                                           }
                                                           db.insert(options,function(){
                                                                  if(++done>=len){
                                                                       result.status=200;
                                                                       result.reson='OK';
                                                                       cb(result);
                                                                  }
                                                           });
                                                     }
                                                });
                                          }  
                                     }
         	        	}
                                else{
         	                     if(o.submit.item[i].option){
                                            var op={
                                                    table: "examitemanswer",
                                                    fields:{
                                                            exa_id2:insertId,
                                                            exa_id:o.submit.item[i].exa_id
                                                    },
                                                    cbParam:o.submit.item[i].option
                                            }
                                            db.insert(op,function(opid,option){                                                     
         	            	                 for(var k in option){
                                                       var b={};
         	            		               b.answer=option[k];
         	            		               b.exa_id=opid;
         	            		               b.exa_id2=k-1;
         	            		               var options = {
                                                             table: "examoptionanswer",                
                                                             fields:b                                     
                                                       }
                                                       db.insert(options,function(){
                                                            if(++done>=len){
                                                                 result.status=200;
                                                                 result.reson='OK';
                                                                 cb(result);
                                                            }                                    	
                                                       });  
         	            	                 }
         	                            });
                                     }
                                     else{
         	                          if(o.submit.item[i].textanswer){
         	            	               var options = {
                                                     table: "examitemanswer",                
                                                     fields:o.submit.item[i]                                     
                                               }  	
         	                               db.insert(options,function(){
         	            	                    if(++done>=len){
         	            		                 result.status=200;
                                                         result.reson='OK';
         	            		                 cb(result);
				                    }
         	                               });                
                                          }
                                          else{
                                                if(++done>=len){
                                                      result.status=200;
                                                      result.reson='OK';
                                                      cb(result);
                                                }
                                                continue;
                                          }
                                     }
                                }
                        }
         });
}






