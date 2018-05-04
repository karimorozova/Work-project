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

function projectJobs(projectId) {
    return new Promise(resolve => {
        homeXtrf.get(`browser/?viewId=880&q.task_project.projectId=eq(${projectId})`).then(function (response) {
            const res = [];
            for(key in response.data.rows)
            {
                let data = response.data.rows[key].columns;
                if(!data[8].includes("Automatic"))
                    res.push(response.data.rows[key].columns);
            }
            resolve(res);
        }).catch(function (error) {
            console.log("errord adding customer, status " + error.response.status + "\n Message :" + error.response.data.errorMessage);
            resolve(error);
        });
    })
}



module.exports = { beginProject , projectJobs  }