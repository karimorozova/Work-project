const { xmlHeader, getHeaders } = require("../../configs");
const parser = require('xml2json');
const soapRequest = require('easy-soap-request');

const url = 'https://memoq.pangea.global:8080/memoQServices/ServerProject/ServerProjectService';
const headerWithoutAction = getHeaders('IServerProjectService');

// const xml = `${xmlHeader}
//         <soapenv:Body>
//             <ns:ListProjectTranslationDocuments>
//                 <ns:serverProjectGuid>0fcd0419-c741-ea11-90ec-9b40ebd15eb0</ns:serverProjectGuid>
//             </ns:ListProjectTranslationDocuments>
//         </soapenv:Body>
//         </soapenv:Envelope>`

async function getMemoqAllProjects() {
    const xml = `${xmlHeader}
            <soapenv:Body>
                <ns:ListProjects>
                <ns:Project>2020 01 28 [17] - Big files 4 [2 files]</ns:Project>
                </ns:ListProjects>
            </soapenv:Body>
            </soapenv:Envelope>`
    const headers = headerWithoutAction('ListProjects');
    try {
        const { response } = await soapRequest({url, headers, xml});
        const result = parser.toJson(response.body, {object: true, sanitize: true, trim: true});
        // const base64String = result["s:Envelope"]["s:Body"].ListProjectTranslationDocumentsResponse.ListProjectTranslationDocumentsResult.ServerProjectTranslationDocInfo
        // return Buffer.from(base64String, 'base64').toString('utf8');
        return result;
    } catch(err) {
        return parser.toJson(err, {object: true, sanitize: true, trim: true});
    }
}

async function createMemoqProject(projectInfo) {
    try {
        const client = projectInfo;
    } catch(err) {
        console.log(err);
        console.log("Error in createMemoqProject");
    }
}

async function createMemoqProjectWithTemplate(projectData) {
    const targets = projectData.targets.reduce((acc, cur) => acc + `<arr:string>${cur.memoq}</arr:string>\n`, '');
    const xml = `${xmlHeader}
                <soapenv:Body>
                <ns:CreateProjectFromTemplate>
                <ns:createInfo>
                    <ns:Client>${projectData.customerName}</ns:Client>
                    <ns:CreatorUser>b0c7615d-4f3c-ea11-8d1e-287fcfe08232</ns:CreatorUser>
                    <ns:Domain>${projectData.industry}</ns:Domain>
                    <ns:Name>[PngSys] ${projectData.projectName}</ns:Name>
                    <ns:Project>[PngSys] ${projectData.projectName}</ns:Project>            
                    <ns:SourceLanguageCode>${projectData.source.memoq}</ns:SourceLanguageCode>
                    <ns:TargetLanguageCodes>${targets}</ns:TargetLanguageCodes>
                    <ns:TemplateGuid>${projectData.template}</ns:TemplateGuid>
                </ns:createInfo>
                </ns:CreateProjectFromTemplate>
            </soapenv:Body>
            </soapenv:Envelope>`
    const headers = headerWithoutAction('CreateProjectFromTemplate');
    try {
        const { response } = await soapRequest({url, headers, xml});
        const result = parser.toJson(response.body, {object: true, sanitize: true, trim: true})["s:Envelope"]["s:Body"];
        const projectId = result ? result.CreateProjectFromTemplateResponse.CreateProjectFromTemplateResult.ProjectGuid : "";
        return projectId;
    } catch(err) {
        return parser.toJson(err, {object: true, sanitize: true, trim: true});
    }
}

async function moveMemoqFileToProject(fileId) {
    const xml = `${xmlHeader}
                <soapenv:Body>
                    <ns:ImportTranslationDocument>
                    <ns:serverProjectGuid>64bdde18-653c-ea11-90ec-9b40ebd15eb0</ns:serverProjectGuid>
                    <ns:fileGuid>${fileId}</ns:fileGuid>
                    </ns:ImportTranslationDocument>
                </soapenv:Body>
                </soapenv:Envelope>`
    const headers = headerWithoutAction('ImportTranslationDocument');
    try {
        const { response } = await soapRequest({url, headers, xml, timeout: 480000});
        const result = parser.toJson(response.body, {object: true, sanitize: true, trim: true});
        return result;
    } catch(err) {
        return parser.toJson(err, {object: true, sanitize: true, trim: true}); 
    }
}

async function getProjectUsers(projectId) {
    const xml = `${xmlHeader}
                <soapenv:Body>
                    <ns:ListProjectUsers>
                        <ns:serverProjectGuid>${projectId}</ns:serverProjectGuid>
                    </ns:ListProjectUsers>
                </soapenv:Body>
            </soapenv:Envelope>`
    const headers = headerWithoutAction('ListProjectUsers');
    try {
        const { response } = await soapRequest({url, headers, xml});
        const result = parser.toJson(response.body, {object: true, sanitize: true, trim: true})["s:Envelope"]["s:Body"].ListProjectUsersResponse;
        return !result.ListProjectUsersResult ? null : result.ListProjectUsersResult.ServerProjectUserInfoHeader;
    } catch(err) {
        return parser.toJson(err, {object: true, sanitize: true, trim: true}); 
    }
}

async function setMemoqProjectUsers(projectId, users) {
    const usersInfo = getUsersInfo(users);
    const xml = `${xmlHeader}
                <soapenv:Body>
                <ns:SetProjectUsers>                
                    <ns:serverProjectGuid>${projectId}</ns:serverProjectGuid>                
                    <ns:userInfos>${usersInfo}</ns:userInfos>
                </ns:SetProjectUsers>
                </soapenv:Body>
            </soapenv:Envelope>`
    const headers = headerWithoutAction('SetProjectUsers');
    try {
        const { response } = await soapRequest({url, headers, xml});
        const result = parser.toJson(response.body, {object: true, sanitize: true, trim: true})["s:Envelope"]["s:Body"];
        return result;
    } catch(err) {
        return parser.toJson(err, {object: true, sanitize: true, trim: true}); 
    }
}

function getUsersInfo(users) {
    const userInfoXml = (id) => `<ns:ServerProjectUserInfo>                    
                                <ns:ProjectRoles>                         
                                    <mem:ProjectManager>false</mem:ProjectManager>                         
                                    <mem:Terminologist>false</mem:Terminologist>
                                </ns:ProjectRoles>                      
                                <ns:UserGuid>${id}</ns:UserGuid>
                            </ns:ServerProjectUserInfo>`
    return users.reduce((acc, cur) => acc + userInfoXml(cur.id), "")
}

async function getProjectTranslationDocs(projectId) {
    const xml = `${xmlHeader}
                <soapenv:Body>
                <ns:ListProjectTranslationDocuments>
                    <ns:serverProjectGuid>${projectId}</ns:serverProjectGuid>
                </ns:ListProjectTranslationDocuments>
                </soapenv:Body>
            </soapenv:Envelope>`
    const headers = headerWithoutAction('ListProjectTranslationDocuments');
    try {
        const { response } = await soapRequest({url, headers, xml});
        const result = parser.toJson(response.body, {object: true, sanitize: true, trim: true})["s:Envelope"]["s:Body"].ListProjectTranslationDocumentsResponse;
        return !result.ListProjectTranslationDocumentsResult ? null : result.ListProjectTranslationDocumentsResult.ServerProjectTranslationDocInfo;
    } catch(err) {
        return parser.toJson(err, {object: true, sanitize: true, trim: true}); 
    }
}

// async function getProjectAnalysis(projectId, docs) {
//     const docIds = docs.reduce((acc, cur) => acc + `<arr:guid>${cur.DocumentGuid}</arr:guid>\n`, '');
//     const langCodes = docs.reduce((acc, cur) => acc + `<arr:string>${cur.TargetLangCode}</arr:string>\n`, '');
//     const xml = `${xmlHeader}
//                 <soapenv:Body>
//                 <ns:RunAnalysis>
//                     <ns:serverProjectGuid>${projectId}</ns:serverProjectGuid>
//                     <ns:options>
//                         <ns:DocumentGuids>${docIds}</ns:DocumentGuids>
//                         <ns:LanguageCodes>${langCodes}</ns:LanguageCodes>
//                         <ns:RepetitionPreferenceOver100>true</ns:RepetitionPreferenceOver100>
//                         <ns:StoreReportInProject>false</ns:StoreReportInProject>
//                         <ns:TagWeightChar>0</ns:TagWeightChar>
//                         <ns:TagWeightWord>0</ns:TagWeightWord>
//                     </ns:options>
//                 </ns:RunAnalysis>
//                 </soapenv:Body>
//             </soapenv:Envelope>`
//     const headers = headerWithoutAction('ListProjectTranslationDocuments');
//     try {
//         const { response } = await soapRequest({url, headers, xml});
//         const result = parser.toJson(response.body, {object: true, sanitize: true, trim: true})["s:Envelope"]["s:Body"].RunAnalysisResponse;
//         return !result.RunAnalysisResult ? null : result.RunAnalysisResult;
//     } catch(err) {
//         return parser.toJson(err, {object: true, sanitize: true, trim: true}); 
//     }
// }

async function getProjectAnalysis(porjectId) {
    const xml = `${xmlHeader}
                <soapenv:Body>
                <ns:RunAnalysis>
                    <ns:serverProjectGuid>${porjectId}</ns:serverProjectGuid>
                    <ns:options>
                        <ns:RepetitionPreferenceOver100>false</ns:RepetitionPreferenceOver100>
                        <ns:StoreReportInProject>false</ns:StoreReportInProject>
                        <ns:TagWeightChar>0</ns:TagWeightChar>
                        <ns:TagWeightWord>0</ns:TagWeightWord>
                    </ns:options>
                </ns:RunAnalysis>
                </soapenv:Body>
            </soapenv:Envelope>`
    const headers = headerWithoutAction('RunAnalysis');
    try {
        const { response } = await soapRequest({url, headers, xml});
        const result = parser.toJson(response.body, {object: true, sanitize: true, trim: true})["s:Envelope"]["s:Body"].RunAnalysisResponse;
        return !result || result.RunAnalysisResult.ResultStatus !== 'Success' ? null : result.RunAnalysisResult.ResultsForTargetLangs;
    } catch(err) {
        return parser.toJson(err, {object: true, sanitize: true, trim: true}); 
    }
}

module.exports = {
    getMemoqAllProjects,
    moveMemoqFileToProject,
    createMemoqProject,
    createMemoqProjectWithTemplate,
    setMemoqProjectUsers,
    getProjectTranslationDocs,
    getProjectAnalysis,
    getProjectUsers
}