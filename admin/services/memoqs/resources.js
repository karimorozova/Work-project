const { xmlHeader, getHeaders } = require("../../configs");
const parser = require('xml2json');
const soapRequest = require('easy-soap-request');

const url = 'https://memoq.pangea.global:8080/memoQServices/Resource/ResourceService';
const headerWithoutAction = getHeaders('IResourceService');

async function getMemoqTemplates() {
    const xml = `${xmlHeader}
                <soapenv:Body>
                <ns:ListResources>
                    <ns:resourceType>ProjectTemplate</ns:resourceType>
                </ns:ListResources>
                </soapenv:Body>
            </soapenv:Envelope>`
    const headers = headerWithoutAction('ListResources');
    try {
        const { response } = await soapRequest({url, headers, xml});
        const result = parser.toJson(response.body, {object: true, sanitize: true, trim: true})["s:Envelope"]["s:Body"].ListResourcesResponse;
        return !result ? null : result.ListResourcesResult.LightResourceInfo.map(item => {return {name: item.Name, id: item.Guid}});
    } catch(err) {
        console.log(err);
        console.log("Error in getMemoqTemplates")
    }
}

module.exports = {
    getMemoqTemplates
}