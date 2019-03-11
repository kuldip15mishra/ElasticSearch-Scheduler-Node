var input = 
`08-Jun-2012 1:00 AM 4ABCDEFGHI
09-Jun-2012 1:00 AM 1ABCDEFGHI
09-Jun-2012 9:23 AM 3ABCDEFGHI
10-Jun-2012 1:00 AM 2ABCDEFGHI
10-Jun-2012 2:03 AM 2ABCDEFGHI
10-Jun-2012 1:00 AM 1ABCDEFGHI
10-Jun-2012 7:23 AM 3ACDEFGHI
10-Jun-2012 9:23 AM 3ABCDEFGHI
11-Jun-2012 1:00 AM 1ABCDEFGHI
11-Jun-2012 2:12 AM 2ABCDEFGHI
11-Jun-2012 8:23 AM 3ABCDEFGHI
12-Jun-2012 10:21 PM 1ABCDEFGHI`;




function CheckCustomer(arguments){

if(arguments){
    let logs = arguments.split('\n');
    var usercount = [];
    var previousdate;
    var previousUserid;
    var counter =0;
    if(logs && logs.length >0){

        logs.forEach(element => {
            let userdata = splitUserDetails(element);
            console.log(userdata[0]);
            let dataformat = new Date(moment(new Date(userdata[0])).add(1,'days').valueOf());

            if(previousdate && new Date(previousdate).getDate() +1 === dataformat.getDate()  && previsouUserid ===userdata[3] && counter <3){
                counter ++;
                console.log("inside");
                usercount.push(userdata[3]);
                if(checkCountForRepeatedExist(usercount)){
                    console.log(userdata[3]);
                    counter =0;
                    previousdate =""
                    previousUserid=""
                }else{
                    console.log(userdata[3]);
                    previousdate =userdata[0];
                    previsouUserid =userdata[3];
                }
                

            }else{
                previousdate =userdata[0];
                previsouUserid =userdata[3];
                usercount.push(userdata[3]);
            }

            
        });
            
    }
}

}

function splitUserDetails(users){
    if(users){
       return  users.split(' ');
    }
}

function checkCountForRepeatedExist(arr,userid){

    if(arr && arr.length >0){
        let res = arr.filter(item =>{
            return item === userid
        })
    }
}