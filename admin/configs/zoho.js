const apiUrl = require('../helpers/apiurl');

const zohoCreds = {
    client_id: '1000.QBVVRSP4IZ1S8JDMX20QVDANQZRNNN',
    client_secret: '442a81152b6ec35d057d93d11d9efb075f853d6ef1',
    // redirect_uri: 'https://pangea.global'
<<<<<<< HEAD
    redirect_uri: `${apiUrl}/pangea-zoho-code`
=======
    // redirect_uri: `${apiUrl}/pangea-zoho-code`
    redirect_uri: `https://admin.pangea.global/pangea-zoho-code`

>>>>>>> b0df725911eac6b1cf36c396233c3b78a850e099
}

module.exports = zohoCreds;