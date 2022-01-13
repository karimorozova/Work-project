const apiUrl = require('../helpers/apiurl');

const zohoCreds = {
    client_id: '1000.QBVVRSP4IZ1S8JDMX20QVDANQZRNNN',
    client_secret: '442a81152b6ec35d057d93d11d9efb075f853d6ef1',
    // redirect_uri: 'https://pangea.global'
    // redirect_uri: `${apiUrl}/pangea-zoho-code`
    // redirect_uri: `https://admin.pangea.global/pangea-zoho-code`
    redirect_uri: `http://localhost:3001/pangea-zoho-code`

}

module.exports = zohoCreds;