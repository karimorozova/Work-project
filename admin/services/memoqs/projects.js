const { xmlHeader, getHeaders } = require("../../configs");
const parser = require('xml2json');
const soapRequest = require('easy-soap-request');
const { getMemoqUsers } = require('./users');

const url = 'https://memoq.pangea.global:8080/memoQServices/ServerProject/ServerProjectService';
const headerWithoutAction = getHeaders('IServerProjectService');

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
        console.log("Error in getMemoqAllProjects");
        return parser.toJson(err, {object: true, sanitize: true, trim: true});
    }
}

async function createMemoqProjectWithTemplate(projectData) {
    const targets = projectData.targets.reduce((acc, cur) => acc + `<arr:string>${cur.memoq}</arr:string>\n`, '');
    const xml = `${xmlHeader}
                <soapenv:Body>
                <ns:CreateProjectFromTemplate>
                <ns:createInfo>
                    <ns:Client>${projectData.customerName}</ns:Client>
                    <ns:CreatorUser>${projectData.creatorUserId}</ns:CreatorUser>
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
        console.log("Error in createMemoqProjectWithTemplate");
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
        console.log("Error in moveMemoqFileToProject");
        return parser.toJson(err, {object: true, sanitize: true, trim: true}); 
    }
}

async function updateMemoqProjectUsers(steps) {
    const stepsStatuses = ["Ready to Start", "Waiting to Start", "Started", "Completed"];
    const wordsUnitSteps = steps.filter(item => item.serviceStep.calculationUnit === 'Words' && stepsStatuses.indexOf(item.status) !== -1);
        const splittedByIdSteps = wordsUnitSteps.reduce((acc, cur) => {
        acc[cur.memoqProjectId] = acc[cur.memoqProjectId] ? [...acc[cur.memoqProjectId], cur] : [cur];
        return acc;
    }, {})
    try {
        if(wordsUnitSteps.length) {
            for(let id in splittedByIdSteps) {
                const error = await setMemoqTranlsators(id, splittedByIdSteps[id]);
                if(error) throw error;
            }
        }
    } catch(err) {
        console.log(err);
        console.log("Error in updateMemoqProjectUsers");
        return err;
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
        console.log("Error in getProjectUsers");
        return parser.toJson(err, {object: true, sanitize: true, trim: true}); 
    }
}

async function setMemoqTranlsators(memoqProjectId, steps) {
    try {
        const users = await getMemoqUsers();
        const assignedSteps = steps.filter(item => item.vendor);
        const projectUsers = assignedSteps.map(item => {
        const memoqUser = users.find(user => user.email === item.vendor.email);
            if(!memoqUser) throw new Error(`No such memoq user - ${item.vendor.firstName} ${item.vendor.surname}`);
            return memoqUser.id;
        });
        const areUsersSet = await setMemoqProjectUsers(memoqProjectId, Array.from(new Set(projectUsers)));
        return areUsersSet ? await assignMemoqTranslators({memoqProjectId, assignedSteps, users}) 
            : new Error("Can't set one or all users in memoQ");
    } catch(err) {
        console.log(err);
        console.log("Error in setMemoqTranslators");
        return err;
    }
}

async function assignMemoqTranslators({memoqProjectId, assignedSteps, users}) {
    const docsInfo = assignedSteps.reduce((acc, cur) => {
        const { id } = users.find(item => item.email === cur.vendor.email);
        for(let docId of cur.memoqDocIds) {
            acc[docId] = acc[docId] || {};
            let users = acc[docId].users || [];
            users.push({
                deadline: cur.deadline,
                memoqRole: cur.serviceStep.memoqAssignmentRole,
                userId: id
            })
            acc[docId].users = users;
        }
        return acc;
    }, {})
    try {
        await setMemoqDocsAssignments(memoqProjectId, docsInfo);
    } catch(err) {
        console.log(err);
        console.log("Error in assignMemoqTranslators");
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
        return !result["s:Fault"];
    } catch(err) {
        console.log("Error in setMemoqProjectUsers");
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
                            </ns:ServerProjectUserInfo>\n`
    return users.reduce((acc, cur) => acc + userInfoXml(cur), "")
}

async function setMemoqDocsAssignments(projectId, docsInfo) {
    const docsUserAssignments = Object.keys(docsInfo).reduce((acc, cur) => {
        const docRoleAssignments = getDocRoleAssignments({docId: cur, users: docsInfo[cur].users});
        return acc + docRoleAssignments;
    }, "");
    const xml = `${xmlHeader}
            <soapenv:Body>
                <ns:SetProjectTranslationDocumentUserAssignments>
                    <ns:serverProjectGuid>${projectId}</ns:serverProjectGuid>
                    <ns:assignments>${docsUserAssignments}</ns:assignments>
                </ns:SetProjectTranslationDocumentUserAssignments>
            </soapenv:Body>
            </soapenv:Envelope>`
    const headers = headerWithoutAction('SetProjectTranslationDocumentUserAssignments');
    try {
        const { response } = await soapRequest({url, headers, xml});
        const result = parser.toJson(response.body, {object: true, sanitize: true, trim: true})["s:Envelope"]["s:Body"];
        return !result["s:Fault"];
    } catch(err) {
        console.log("Error in setMemoqDocsAssignments");
        return parser.toJson(err, {object: true, sanitize: true, trim: true}); 
    }
}

function getDocRoleAssignments(obj) {
    const roles = obj.users ? getRoles(obj.users) : "";
    return `<ns:ServerProjectTranslationDocumentUserAssignments>
            <ns:DocumentGuid>${obj.docId}</ns:DocumentGuid>
            <ns:UserRoleAssignments>${roles}</ns:UserRoleAssignments>
        </ns:ServerProjectTranslationDocumentUserAssignments>\n`
}

function getRoles(users) {
    return users.reduce((acc, cur) => {
        return acc + `<ns:TranslationDocumentUserRoleAssignment>
                <ns:DeadLine>${cur.deadline}</ns:DeadLine>
                <ns:DocumentAssignmentRole>${cur.memoqRole}</ns:DocumentAssignmentRole>
                <ns:UserGuid>${cur.userId}</ns:UserGuid>
            </ns:TranslationDocumentUserRoleAssignment>\n`
    }, '')
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
        console.log("Error in getProjectTranslationDocs");
        return parser.toJson(err, {object: true, sanitize: true, trim: true}); 
    }
}

async function getProjectAnalysis(projectId) {
    const xml = `${xmlHeader}
                <soapenv:Body>
                <ns:RunAnalysis>
                    <ns:serverProjectGuid>${projectId}</ns:serverProjectGuid>
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
        console.log("Error in getProjectAnalysis");
        return parser.toJson(err, {object: true, sanitize: true, trim: true}); 
    }
}

async function setMemoqDocStatus({projectId, docIds, status}) {
    const docStatusInfo = getDocStatusInfo(docIds, status);
    const xml = `${xmlHeader}
                <soapenv:Body>
                <ns:SetDocumentWorkflowStatus>
                    <ns:serverProjectGuid>${projectId}</ns:serverProjectGuid>
                    <ns:workflowChanges>${docStatusInfo}</ns:workflowChanges>
                </ns:SetDocumentWorkflowStatus>
                </soapenv:Body>
            </soapenv:Envelope>`
    const headers = headerWithoutAction('SetDocumentWorkflowStatus');
    try {
        const { response } = await soapRequest({url, headers, xml});
        const result = parser.toJson(response.body, {object: true, sanitize: true, trim: true})["s:Envelope"]["s:Body"];
        return !result["s:Fault"];
    } catch(err) {
        console.log("Error in setMemoqDocStatus");
        return parser.toJson(err, {object: true, sanitize: true, trim: true}); 
    }
}

function getDocStatusInfo(docIds, status) {
    docIds.reduce((acc, cur) => {
        return acc + `<ns:ServerProjectTranslationDocumentWorkflowStatusChange>
            <ns:DocumentGuid>${cur}</ns:DocumentGuid>
            <ns:WorkflowStatus>${status}</ns:WorkflowStatus>
            </ns:ServerProjectTranslationDocumentWorkflowStatusChange>\n`
    }, "");
}

async function cancelMemoqDocs(tasks) {
    const memoqDocs = tasks.reduce((acc, cur) => {
        const { memoqProjectId, memoqDocs } = cur;
        acc[memoqProjectId] = acc[memoqProjectId] ? [...acc[memoqProjectId], ...memoqDocs] : [...memoqDocs];
        return acc;
    }, {});
    try {
        await unassignMemoqDocs(memoqDocs);
    } catch(err) {
        console.log(err);
        console.log("Error in cancelMemoqDocs");
    }
}

async function unassignMemoqDocs(memoqDocs) {
    try {
        for(let key in memoqDocs) {
            const docsInfo = memoqDocs[key].reduce((acc, cur) => {
                return {...acc, [cur.DocumentGuid]: ""}
            }, {})
            await setMemoqDocsAssignments(key, docsInfo);
        }
    } catch(err) {
        console.log(err);
        console.log("Error in unassignMemoqDocs");
    }
}

async function setCancelledNameInMemoq(tasks, projectName) {
    let diffCounter = 0;
    const names = tasks.reduce((acc, cur) => {
        const { memoqProjectId } = cur;
        if(!acc[memoqProjectId]) {
            const name = diffCounter ? `${projectName}-${diffCounter}` : projectName;
            acc[memoqProjectId] = name;
            diffCounter++;
        }
        return acc;
    }, {})
    try {
        for(const key in names) {
            await renameMemoqProject(key, `${names[key]} - Cancelled`);
        }

    } catch(err) {
        console.log(err);
        console.log("Error in setCancelledNameInMemoq");
    }
}

async function renameMemoqProject(projectId, name) {
    const xml = `${xmlHeader}
                <soapenv:Body>
                <ns:RenameProject>
                    <ns:serverProjectGuid>${projectId}</ns:serverProjectGuid>
                    <ns:newName>[PngSys] ${name}</ns:newName>
                </ns:RenameProject>
                </soapenv:Body>
            </soapenv:Envelope>`
    const headers = headerWithoutAction('RenameProject');
    try {
        const { response } = await soapRequest({url, headers, xml});
        const result = parser.toJson(response.body, {object: true, sanitize: true, trim: true})["s:Envelope"]["s:Body"];
        return !result["s:Fault"];
    } catch(err) {
        console.log("Error in renameMemoqProject");
        return parser.toJson(err, {object: true, sanitize: true, trim: true}); 
    }
}

async function getMemoqFileId(projectId, docId) {
    const xml = `${xmlHeader}
            <soapenv:Body>
            <ns:ExportTranslationDocumentAsTwoColumnRtf>
                <ns:serverProjectGuid>${projectId}</ns:serverProjectGuid>
                <ns:docGuid>${docId}</ns:docGuid>
                <ns:options>
                    <ns:ExportComment>true</ns:ExportComment>
                    <ns:ExportSegmentStatus>false</ns:ExportSegmentStatus>
                    <ns:ExportTwoTargetColumns>false</ns:ExportTwoTargetColumns>
                    <ns:SecondTargetColumnEmpty>false</ns:SecondTargetColumnEmpty>
                </ns:options>
            </ns:ExportTranslationDocumentAsTwoColumnRtf>
            </soapenv:Body>
        </soapenv:Envelope>`
    const headers = headerWithoutAction('ExportTranslationDocumentAsTwoColumnRtf');
    try {
        const { response } = await soapRequest({url, headers, xml});
        const result = parser.toJson(response.body, {object: true, sanitize: true, trim: true})["s:Envelope"]["s:Body"];
        return !result["s:Fault"] ? 
            result.ExportTranslationDocumentAsTwoColumnRtfResponse.ExportTranslationDocumentAsTwoColumnRtfResult.FileGuid : false;
    } catch(err) {
        console.log("Error in getMemoqFileId");
        return parser.toJson(err, {object: true, sanitize: true, trim: true}); 
    }
}

module.exports = {
    getMemoqAllProjects,
    moveMemoqFileToProject,
    createMemoqProjectWithTemplate,
    setMemoqProjectUsers,
    getProjectTranslationDocs,
    getProjectAnalysis,
    getProjectUsers,
    setMemoqTranlsators,
    updateMemoqProjectUsers,
    setMemoqDocStatus,
    getMemoqFileId,
    cancelMemoqDocs,
    setCancelledNameInMemoq
}