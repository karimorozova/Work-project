const { xmlHeader, getHeaders } = require("../../configs");
const parser = require('xml2json');
const soapRequest = require('easy-soap-request');

const url = 'https://memoq.pangea.global:8080/memoQServices/Security/SecurityService';
const headerWithoutAction = getHeaders('ISecurityService');

async function getMemoqUsers() {
    const xml = `${xmlHeader}
                <soapenv:Body>
                    <ns:ListUsers/>
                </soapenv:Body>
            </soapenv:Envelope>`
    const headers = headerWithoutAction('ListUsers');
    try {
        const { response } = await soapRequest({url, headers, xml});
        const result = parser.toJson(response.body, {object: true, sanitize: true, trim: true})["s:Envelope"]["s:Body"].ListUsersResponse;
        return !result ? null : result.ListUsersResult.UserInfo.map(item => {
            return {email: item.EmailAddress, id: item.UserGuid, fullName: item.FullName, userName: item.UserName}
        });
    } catch(err) {
        console.log(err);
        console.log("Error in getMemoqUsers");
    }
}

module.exports = {
    getMemoqUsers
}