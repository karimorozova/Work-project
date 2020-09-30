const { xmlHeader, getHeaders } = require("../../configs");
const parser = require('xml2json');
const soapRequest = require('easy-soap-request');

const url = 'https://memoq.pangea.global:8080/memoQServices/Security/SecurityService';
const headerWithoutAction = getHeaders('ISecurityService');

async function getMemoqUsers () {
  const xml = `${xmlHeader}
                <soapenv:Body>
                    <ns:ListUsers/>
                </soapenv:Body>
            </soapenv:Envelope>`;
  const headers = headerWithoutAction('ListUsers');
  try {
    const { response } = await soapRequest({ url, headers, xml });
    const result = parser.toJson(response.body, {
      object: true,
      sanitize: true,
      trim: true
    })["s:Envelope"]["s:Body"].ListUsersResponse;
    return !result ? null : result.ListUsersResult.UserInfo.map(item => {
      return { email: item.EmailAddress, id: item.UserGuid, fullName: item.FullName, userName: item.UserName };
    });
  } catch (err) {
    console.log(err);
    console.log("Error in getMemoqUsers");
  }
}

const getMemoqUser = async (guid) => {
  const xml = `${xmlHeader}
      <soapenv:Body>
          <ns:GetUser>
             <ns:userGuid>${guid}</ns:userGuid>
          </ns:GetUser>
       </soapenv:Body>
    </soapenv:Envelope>`;

  const headers = headerWithoutAction('GetUser');
  try {
    const { response } = await soapRequest({ url, headers, xml });
    const result = parser.toJson(response.body, {
      object: true,
      sanitize: true,
      trim: true
    })['s:Envelope']['s:Body'].GetUserResponse;
    if (result) {
      const { GetUserResult } = result;
      const { UserGuid, EmailAddress, FullName, UserName } = GetUserResult;
      return {
        id: UserGuid,
        email: EmailAddress,
        fullName: FullName,
        userName: UserName
      };
    }
    return null;
  } catch (err) {
    console.log(err);
    console.log("Error in getMemoqUser");
  }
};

const createMemoqUser = async ({ firstName, surname, email }) => {
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

const deleteMemoqUser = async (guid) => {
  const xml = `${xmlHeader}
    <soapenv:Body>
      <ns:DeleteUser>
         <ns:userGuid>${guid}</ns:userGuid>
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
  getMemoqUsers,
  getMemoqUser,
  createMemoqUser,
  deleteMemoqUser
};
