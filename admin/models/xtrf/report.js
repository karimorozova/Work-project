const axios = require('axios');

const homeXtrf = axios.create({
    baseURL: 'https://pangea.s.xtrf.eu/home-api/',
    headers: {
        'X-AUTH-ACCESS-TOKEN': 'U0mLa6os4DIBAsXErcSUvxU0cj'
    }
});

function beginProject(pageNum = -1) {
    return new Promise(resolve => {
        homeXtrf.get(`browser/?viewId=876&page=${pageNum}`).then(function (response) {
            if(pageNum == -1){
                resolve(response.data.header.pagination.pagesCount);
            }
            else{
                resolve(response.data.rows);
            }
        }).catch(function (error) {
            console.log("errord adding customer, status " + error.response.status + "\n Message :" + error.response.data.errorMessage);
            resolve(error);
        });
    })
}



module.exports = { beginProject  }