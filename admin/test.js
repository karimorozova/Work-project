const  { HomeApi }  = require("./models/xtrf/");


async function runTest() {
    console.log("Begin test");
    const customerInfo = await ( HomeApi.findCustomer("11111"));
    console.log("customer info " + customerInfo);
}
//

runTest();

