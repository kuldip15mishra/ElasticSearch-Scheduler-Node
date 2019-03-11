
//http client library
const axios = require('axios');
const constant= require('./constant');

//data time library
var moment = require('moment');

//Elastic DB imports
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'http://localhost:9200',
    log: 'debug'
});

//Logging Imports
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'debug';

//File Reading Imports
var fs = require('fs');


//Function to Bulk insert to Elastic DB
exports.LoopBulkInsert = async (_skip =0,_take=0,_count=0,headers) => {
    let count =_count;
    let take = _take;
    let skip = _skip;
  
    logger.info('Step 5 : Fetching Siganls from Platform Services' );
    try {
    GetTotalCount(headers).then(res=>{
        if(res && res.data && res.data.totalCount && res.data.totalCount >0){
            count=_count >0  ? _count :res.data.totalCount;
            take =count;
            logger.info('Step 5.1 :TotalCOunt of Signals :'  +count  );
            //while (skip < count) {

                FetchSignals(skip, take,headers).then(res => {
                        if (res && res.data && res.data.data && res.data.data.length > 0) {
                           
                            InsertDataToElasticDB(res.data.data,take)
                            //setTimeout(,1000);
                        }
                    }
        
                ).catch(err=>{
                    console.log(err)
                })
               
           //     skip += take;
            //}
            logger.info('Step 5.1 : Total Signals Fetched :' +skip );
            constants.Isfetching =false;   
        }
    }).catch(   (e)=>{
        lastpulltime = moment(new Date()).unix();
        var data = JSON.stringify({time :lastpulltime ,Isfetching :false}, null, 2);
        writeToFile(data);
    })
}
catch(err) {
    console.log(err)
  }
   
}



//Function for retry logic if insertion fails
async function RetryLogic(_skip =0,_take=1,_count=0) {
    let count =0;
    let take = _take;
    let skip = _skip;
  
    logger.info('Step 5 : Fetching Siganls from Platform Services' );
    try {
    GetTotalCount().then(res=>{
        if(res && res.data && res.data.totalCount && res.data.totalCount >0){
            count=res.data.totalCount;
            take =count;
            logger.info('Step 5.1 :TotalCOunt of Signals :'  +count  );
            //while (skip < count) {

                FetchSignals(skip, take).then(res => {
                        if (res && res.data && res.data.data && res.data.data.length > 0) {
                           
                           
                       //     setTimeout(
                                InsertDataToElasticDB(res.data.data,take)
                                //,1000);
                        }
                    }
        
                )
               
           //     skip += take;
            //}
            logger.info('Step 5.1 : Total Signals Fetched :' +skip );
            constants.Isfetching =false;   
        }
    })
}
catch(err) {
    console.log(err)
  }
   
}


exports.CheckIndicesExist =async()=>{
    try {
    return client.indices
    .exists({
      index: constant.IndexName
    })}catch(err) {
        console.log(err)
      }
}

exports.CreateIndex = async () => {
    try {
    let req = {
        "url": 'http://localhost:9200/' +constant.IndexName,
        method: 'PUT',
        data: constant.Index
      }
      return axios(req);}catch(err) {
        console.log(err)
      }
}

exports.DeleteIndex = async (data) => {
    try {
    let req = {
        "url": 'http://localhost:9200/' +constant.IndexName,
        method: 'DELETE'
       
      }
      return axios(req);
    }catch(err) {
        console.log(err)
      }
}
const GetIndexDocumentCount = async (data) => {
    try {
    let req = {
        "url": 'http://localhost:9200/' +constant.IndexName + '/_search',
        method: 'GET'
       
      }
      return axios(req);
    }catch(err) {
        console.log(err)
      }
}

exports.GetIndexDocumentCountExported  = async (data) => {
    try {
    let req = {
        "url": 'http://localhost:9200/' +constant.IndexName + '/_search',
        method: 'GET'
       
      }
      return axios(req);
    }catch(err) {
        console.log(err)
      }
}

const InsertDataToElasticDB = async (data,take) => {
    try {
    var list = [];
    for (j = 0; j < data.length; j++) {
        var obj = {}
        obj = {
            "method": 'post',
            "url": 'http://localhost:9200/'+  constant.IndexName + '/signals',
            "data": data[j]
        }
        list.push(obj)
    }

    logger.info('Step 6 : Create Batch Request for Signals to be inserted '  );
    new Promise((resolve, reject) => {
        postallList(list)
            .then(function (results) {
                if (results) {
                    // lastpulltime = moment(new Date()).unix();
                    // let data = JSON.stringify({time :lastpulltime ,Isfetching :false}, null, 2);
                    // writeToFile(data);
                    resolve(results)
                    logger.info('Step 7 : Records inserted successfully '  );
                } 

            }).catch(function (err) {
                // if(err && err.response && err.response.data &&  err.response.data.status ===429){
                //     GetIndexDocumentCount().then(res=>{
                //         if(res && res.data && res.data.hits ){
                //             let currentRecords= res.data.hits.total;
                //             let diff =(take-currentRecords);
                //             if(diff>0){
                //                 RetryLogic(currentRecords,take,0) ;
                //             }
                //         }
                //     })
                // }
                
                reject(err)

                //console.log(err);

            })
    })}catch(err) {
       console.log(err)
      }
      finally{
        lastpulltime = moment(new Date()).unix();
        let data = JSON.stringify({time :lastpulltime ,Isfetching :false}, null, 2);
        writeToFile(data);
      }
}
const FetchSignals = async (skip, take,headers) => {
    try{
            let signalurl = constant.URL.signalsURL + '?skip=' + skip + '&limit=' + take;
            return axios.get(signalurl,{ 'headers':headers});
    
    }catch(err) {
                console.log(err)
              }
}

const GetTotalCount =async(headers) =>{
    try{
    let signalurl = constant.URL.signalsURL;
    return axios.get(signalurl,{ 'headers':headers});
    }catch(err) {
        console.log(err)
      }
}

exports.GetTotalCountExported =async(headers) =>{
    try{
    let signalurl = constant.URL.signalsURL;
    return axios.get(signalurl,{ 'headers':headers});
    }catch(err) {
        console.log(err)
      }
}
const getallList = (requestList) => {
    return axios.all(requestList.map(l => axios.get(l)));
    
}

const postallList = (requestList) => {
    return axios.all(requestList.map(l => axios.request(l)));
}

const writeToFile = async (data)=>{
    
    fs.writeFile('config.json', data, function(err){
        if (err) console.log(err);
        console.log("Successfully Written to File.");
    });
}
