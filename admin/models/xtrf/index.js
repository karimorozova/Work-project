const ClientApi = require('./client');
const HomeApi = require('./home');

async function quote(request) {

    console.log("Begin creating quote");
    const classic = request.service.projectType === "regular";
    console.log(`Project is regular : ${classic}`);

    var customerId = await (HomeApi.findCustomer(request.companyName));
    if(!customerId)
    {
        customerId = await (HomeApi.createCustomer(request));
    }
    console.log("Customer id " + customerId);
    try {
        if (classic) {
            console.log("Creating classic quote");
            var token = await (HomeApi.generateToken(request.contactEmail));
            var sessionId = await (ClientApi.login(token));

            var clientApi = new ClientApi(request, sessionId);
            // here upload files 

            var quoteId = await (clientApi.createQuote());
        }
        else {
            var quote = await (HomeApi.addQuote(customerId, request));
            var srclang = await (HomeApi.setSrcLanguage("/v2/quotes/" + quote.id + "/sourceLanguage", request.sourceLanguage.xtrf));
            var trgLang = await (HomeApi.setTargetLanguage("/v2/quotes/" + quote.id + "/targetLanguages", request.targetArray()));
        }
    }
    catch (err) {
        console.log("Error adding quote" + err);
    }
}

async function project(request) {

    console.log("Begin creating project");
    const classic = request.service.projectType === "regular";
    console.log(`Project is regular : ${classic}`);

    var customerId = await (HomeApi.findCustomer(request.companyName));
    if(!customerId)
    {
        customerId = await (HomeApi.createCustomer(request));
    }
    console.log("Customer id " + customerId);
    try {
        if (classic) {
            console.log("Creating classic project");
            var token = await (HomeApi.generateToken(request.contactEmail));
            var sessionId = await (ClientApi.login(token));
                // here upload files 
            var projectId = await (HomeApi.addClassicProject(customerId, request));
        } else {
            var project = await (HomeApi.addSmartProject(customerId, request));
            var srclang = await (HomeApi.setSrcLanguage("/v2/projects/" + project.id + "/sourceLanguage", request.sourceLanguage.xtrf));
            var trgLang = await (HomeApi.setTargetLanguage("/v2/projects/" + project.id + "/targetLanguages", request.targetArray()));
            var deadline = await (HomeApi.deadlineAdd("/v2/projects/" + project.id + "/clientDeadline", request.deadline()));
        }
        
    }
    catch (err) {
        console.log("Error adding project" + err);
    }
}

async function authClient(login, pass) {
   const jsessionId = await (ClientApi.authUser(login, pass));
}

const Models = {
    ClientApi,
    HomeApi,
    quote,
    authClient,
    project
};

module.exports = Models;
