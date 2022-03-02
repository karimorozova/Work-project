const { XMLHttpRequest } = require("xmlhttprequest");

const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
                    <soapenv:Envelope 
                        xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                        xmlns:ns="http://kilgray.com/memoqservices/2007"
                        xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays"
                        xmlns:mem="http://schemas.datacontract.org/2004/07/MemoQServices">
                    <soapenv:Header>
                    <ApiKey>${process.env.MEMOQ_SECRET_KEY}</ApiKey>
                    </soapenv:Header>`;

function getHeaders(endpoint) {
    return (action) => {
        return {
            'Content-Type': 'text/xml;charset=UTF-8',
            'soapAction': `http://kilgray.com/memoqservices/2007/${endpoint}/${action}`,
        }
    }
}

function createCORSRequest(method, url) {
    let xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        xhr.open(method, url, false);
    } else if (typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        console.log("CORS not supported");
        xhr = null;
    }
    return xhr;
}

module.exports = { xmlHeader, getHeaders, createCORSRequest }