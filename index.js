var service = require('./service');
const cron = require("node-cron");
const express = require("express");
var moment = require('moment');
const constants = require('./constant');
var fs = require('fs');
var lastpulltime = moment(new Date()).unix();
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
const axios = require('axios');

app = express();
var log4js = require('log4js');
log4js.configure({
    appenders: {
        log: {
            type: 'file',
            filename: 'cronDetails.log'
        }
    },
    categories: {
        default: {
            appenders: ['log'],
            level: 'debug'
        }
    }
});
var logger = log4js.getLogger();
logger.level = 'debug';
var schedule = require('node-schedule');
//schedule tasks to be run on the server   
// var schedule = require('node-schedule');
var timer;
// var rule = new schedule.RecurrenceRule();
// rule.minute = 7;
schedule.scheduleJob('*/5 * * * *', function () {
    timer = null;
    lastpulltime = moment(new Date()).unix();
    let data = JSON.stringify({
        time: lastpulltime,
        Isfetching: false
    }, null, 2);
    fs.writeFile('config.json', data, function (err) {
        if (err) console.log(err);
        service.DeleteIndex().then(response => {
            if (response && response.data && response.data.acknowledged) {
              //  timer = setInterval(main, 30000);
              console.log("Index deleted");
                schedule.scheduleJob('*/30 * * * * *', function () {
                    
                    main();
                })
            }
        }).catch((e) => {
            service.CreateIndex().then(response => {
                if (response && response.data && response.data.acknowledged) {
                    console.log("Index created");
                    schedule.scheduleJob('*/30 * * * * *', function () {
                        main();
                    })
                }
            });
        })

    });



});
const getSessionID =async ()=>{

    var loginRequestModel = {
        email:"YjRhYzc2YWVhY2M2ZThkNTJkMTIzZTY1NGU1N2U2NjI6OjQwZTcxY2VkYzBmYzkwM2ZkNGNmZWU3ZjlmMmM3Mjg1OjpEZExKLytUYkRNaVJaeWdYNHBrWk5PeCt0OUVIN0lMTEdDQ0dRaDRPRElJPQ==",
        password:"YmNjMjViY2IzZmQyNWMxZmMyMDBmMjZiNmQ0OGMzMzI6OjcwODY3YTk2NjlkY2YyYzJjZDY4NTA5MzU5ZDk2ZTVhOjpmZjVSZ1czUUkvMU1qT0s0N1R4M2hnPT0="       
   }
   var headers= {
       'app-id':constants.URL.id,
       'Accept': 'application/json',
       'Content-Type': 'application/json',
     }
   // localStorage.setItem("token", "Smith");
  
   


   
   let url =constants.URL.AUTHENTICATE;
   return axios.post(url, loginRequestModel,{headers :headers});
}
const main = async () => {
    try {
        fs.readFile('config.json', function (err, buf) {
            if (buf && buf.length > 0) {
                try {
                    obj = JSON.parse(buf);
                } catch (e) {
                    lastpulltime = moment(new Date()).unix();
                    let data = JSON.stringify({
                        time: lastpulltime,
                        Isfetching: false
                    }, null, 2);
                    writeToFile(data);
                }

                if (obj && obj.time && !obj.Isfetching) {
                    let data = JSON.stringify({
                        time: lastpulltime,
                        Isfetching: true
                    }, null, 2);
                    fs.writeFile('config.json', JSON.stringify(obj), function (err) {
                        if (err) console.log(err);
                        console.log("Started");
                        getSessionID().then(response=>{

                            if(response && response.data){
                                console.log("Session Fetched Successfully" )
                                console.log(response.data )
                                headers= {
                                    'user-id': response.data.data.userId,
                                    'session-id':response.data.data.sessionId,
                                    'app-id':constants.URL.id
                                }
                                 start(headers);
                            }

                        }).catch(err=>{
                            console.log("Session Fetched Error Occurent" )
                            console.log(err)
                        })

                    });
                 

                }
            } else {
                //    lastpulltime = moment(new Date()).unix();
                //       let data = JSON.stringify({time :lastpulltime ,Isfetching :false}, null, 2);
                //       writeToFile(data);
            }
        });
    } catch (e) {
        if (e) {
            lastpulltime = moment(new Date()).unix();
            let data = JSON.stringify({
                time: lastpulltime,
                Isfetching: false
            }, null, 2);
            writeToFile(data);
        }
    } finally {
        //console.log("application closed");

    }

}
const start = async (headers) => {
    try {
       
        // schedule.scheduleJob(rule, function(){
        //cron.schedule( '* * * * *',  ()=> {
        console.log("before running a task every minute");
        //if(!constants.Isfetching)  { 
        // constants.Isfetching =true;   
       
           
            service.CheckIndicesExist().then(isexist => {

                if (isexist) {
                    console.log('Step 1 : Check Index Exist or Not');
    
                    service.GetTotalCountExported(headers).then(res => {
                        if (res && res.data && res.data.totalCount) {
                            console.log('Step 2: Check Total counts');
                            count = res.data.totalCount;
                            take = count;
                            service.GetIndexDocumentCountExported().then(res => {
                                if (res && res.data && res.data.hits) {
                                    console.log('Step 3: Check Total record in current elastic DB');
                                    let currentRecords = res.data.hits.total;
                                    if (count === currentRecords || currentRecords === 0) {
                                        console.log('Step 4: If current records is 0 or equal to total count ');
                                       
                                        console.log("Filling Elastic db for remining count :" + currentRecords);
                                        lastpulltime = moment(new Date()).unix();
                                        let data = JSON.stringify({
                                            time: lastpulltime,
                                            Isfetching: true
                                        }, null, 2);
                                        fs.writeFile('config.json', JSON.stringify(obj), function (err) {
                                            if (err) console.log(err);
                                            console.log("Started loopbulkinsert functiona call.");
                                            service.LoopBulkInsert(currentRecords, take, 0,headers);
    
                                        });
    
                                    } else if (count > currentRecords) {
                                        console.log('Step5: If current records is less than total records  in meta db ');
                                      
                                        service.GetIndexDocumentCountExported().then(res => {
                                            if (res && res.data && res.data.hits) {
                                                console.log('Step6: Get toal records that are in elastic DB ');
                                     
                                                let currentRecords = res.data.hits.total;
                                                let diff = (take - currentRecords);
                                                if (diff > 0) {
                                                    console.log("Filling Elastic db for remining diff :" + diff);
                                                    console.log("Current records :" + currentRecords);
                                                    console.log("take :" + take);
                                                    lastpulltime = moment(new Date()).unix();
                                                    let data = JSON.stringify({
                                                        time: lastpulltime,
                                                        Isfetching: true
                                                    }, null, 2);
                                                    fs.writeFile('config.json', JSON.stringify(obj), function (err) {
                                                        if (err) console.log(err);
                                                        console.log("Started loopbulkinsert functiona call.");
                                                        service.LoopBulkInsert(currentRecords, take, 0,headers);
                
                                                    });
                                                }
                                            }
    
                                        })
                                    }
    
                                }
                            });
    
    
                        }
                    }).catch(err=>{
                        console.log(err)
                    });
                } else {
    
                    service.CreateIndex().then(response => {
                        if (response && response.data && response.data.acknowledged) {
    
                            console.log("Index Created Successfully");
                        
                              
                                    console.log("LoopBulkInsert started for First time after index creation");
                                    lastpulltime = moment(new Date()).unix();
                                    let data = JSON.stringify({
                                        time: lastpulltime,
                                        Isfetching: true
                                    }, null, 2);
                                   
                                    fs.writeFile('config.json', JSON.stringify(data), function (err) {
                                        if (err) console.log(err);
                                      
                                        service.LoopBulkInsert(0,0,0,headers);
    
                                    });
                                    
                               
                           
                        }
                    }, response => {
                        console.log(response)
                        //this.handleEditError(response)
                    })
                }
            });
       
     

        // }else{
        //     logger.info('Step 0 : Previous Step in progress not starting again.');
        // }
    } catch (e) {

    } finally {
        //   console.log("application closed");
        //    lastpulltime = moment(new Date()).unix();
        //   let data = JSON.stringify({time :lastpulltime ,Isfetching :false}, null, 2);
        //  writeToFile(data);
    }
}



const writeToFile = async (data) => {

    fs.writeFile('config.json', data, function (err) {
        if (err) console.log(err);
        console.log("Successfully Written to File.");
    });
}

app.listen(3128);