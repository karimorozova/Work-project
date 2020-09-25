const { xmlHeader, getHeaders } = require("../../configs");
const parser = require('xml2json');
const soapRequest = require('easy-soap-request');

const url = 'https://memoq.pangea.global:8080/memoQServices/Security/SecurityService';
const headerWithoutAction = getHeaders('ISecurityService');

const createVendorOnMemoq = async (vendor) => {
  const { firstName, surname, email } = vendor;
  const xml = `${xmlHeader}
     <soapenv:Body>
      <ns:CreateUser>
         <ns:userInfo>
            <ns:EmailAddress>${email}</ns:EmailAddress>
            <ns:FullName>${firstName} ${surname}</ns:FullName>
            <ns:LTFullName>${firstName} ${surname}</ns:LTFullName>
            <ns:LTUsername>${email}</ns:LTUsername>
            <ns:Password>secret</ns:Password>
            <ns:UserName>${email}</ns:UserName>
         </ns:userInfo>
      </ns:CreateUser>
   </soapenv:Body>
</soapenv:Envelope>`;

  const headers = headerWithoutAction('CreateUser');
  try {
    const { response } = await soapRequest({ url, headers, xml });
    const result = parser.toJson(response.body, {
      object: true,
      sanitize: true,
      trim: true
    })['s:Envelope']['s:Body'].CreateUserResponse;
    return !result ? null : result.CreateUserResult;
  } catch (err) {
    console.log(err);
    console.log('Error in createVendorOnMemoq');
  }
};

const deleteVendorOnMemoq = async (vendorGuid) => {
  const xml = `${xmlHeader}
    <soapenv:Body>
      <ns:DeleteUser>
         <ns:userGuid>${vendorGuid}</ns:userGuid>
      </ns:DeleteUser>
   </soapenv:Body>
</soapenv:Envelope>`;

  const headers = headerWithoutAction('DeleteUser');
  try {
    const { response } = await soapRequest({ url, headers, xml });
    return response;
  } catch (err) {
    console.log(err);
    console.log('Error in createVendorOnMemoq');
  }
};

module.exports = {
  createVendorOnMemoq,
  deleteVendorOnMemoq
};
