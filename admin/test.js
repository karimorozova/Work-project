const  { beginProject }  = require("./models/xtrf/report");


async function runTest() {
    console.log("Begin test");

    var rows = [];
    const pageCount = await beginProject();
    for(let i=1; i<=pageCount; i++){
        var pageRows = await beginProject(i);

        for(row in pageRows){
            rows.push(pageRows[row]);
        }       
    }
    //const customerInfo = await ( HomeApi.findCustomer("11111"));
    //console.log("customer info " + customerInfo);

    console.log("Test Ended");
}
//

const res = runTest();

