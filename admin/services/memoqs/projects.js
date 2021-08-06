const { xmlHeader, getHeaders } = require('../../configs');
const parser = require('xml2json');
const soapRequest = require('easy-soap-request');
const { getMemoqUsers } = require('./users');
const { MemoqProject, Languages, Clients, Vendors } = require('../../models');
const { createOtherProjectFinanceData, checkProjectStructure, doesAllTasksFinished, defineProjectStatus, clearGarbageProjects } = require('./otherProjects');
const { findLanguageByMemoqLanguageCode } = require('../../helpers/commonFunctions');
const { getMemoqMetrics, getMemoqMetricsForUndefinedDocuments } = require('../../helpers/projectMetrics')
const moment = require('moment');
const _ = require("lodash");

const url = 'https://memoq.pangea.global:8080/memoQServices/ServerProject/ServerProjectService';
const headerWithoutAction = getHeaders('IServerProjectService');

async function getMemoqAllProjects() {
	const xml = `${ xmlHeader }
            <soapenv:Body>
                <ns:ListProjects>
                </ns:ListProjects>
            </soapenv:Body>
            </soapenv:Envelope>`
	const headers = headerWithoutAction('ListProjects');
	try {
		const { response } = await soapRequest({ url, headers, xml });
		const result = parser.toJson(response.body, { object: true, sanitize: true, trim: true })["s:Envelope"]["s:Body"];
		return result.ListProjectsResponse.ListProjectsResult.ServerProjectInfo;
	} catch (err) {
		console.log("Error in getMemoqAllProjects");
		console.log(err);
		throw new Error(err.message);
	}
}

async function assignedDefaultTranslator(projectId, step) {
	const currentUsers = await getProjectUsers(projectId);
	const currentProjectUsers = currentUsers.map(item => {
		return { id: item.User.UserGuid, isPm: item.ProjectRoles["a:ProjectManager"] }
	});
	currentProjectUsers.push({ isPm: false, id: '5c758a3b-f723-eb11-8d6a-287fcfe08232' });
	await setMemoqProjectUsers(projectId, currentProjectUsers);

	const stepDocuments = step.memoqDocIds.reduce((acc, curr) => {
		acc = acc + `<ns:ServerProjectTranslationDocumentUserAssignments>
							  <ns:DocumentGuid>${ curr }</ns:DocumentGuid>
							  <ns:UserRoleAssignments>
							    <ns:TranslationDocumentUserRoleAssignment>
							        <ns:DeadLine>${ step.deadline }</ns:DeadLine>
							        <ns:DocumentAssignmentRole>${ step.serviceStep.memoqAssignmentRole }</ns:DocumentAssignmentRole>
							        <ns:UserGuid>5c758a3b-f723-eb11-8d6a-287fcfe08232</ns:UserGuid>
							    </ns:TranslationDocumentUserRoleAssignment>
								</ns:UserRoleAssignments>
							</ns:ServerProjectTranslationDocumentUserAssignments>`;
		return acc;
	}, "");
	const xml = `${ xmlHeader }
	            <soapenv:Body>
	              <ns:SetProjectTranslationDocumentUserAssignments>
	                  <ns:serverProjectGuid>${ projectId }</ns:serverProjectGuid>
	                  <ns:assignments>${ stepDocuments }</ns:assignments>
	              </ns:SetProjectTranslationDocumentUserAssignments>
	          </soapenv:Body>
	          </soapenv:Envelope>`;
	const headers = headerWithoutAction('SetProjectTranslationDocumentUserAssignments');
	try {
		const { response } = await soapRequest({ url, headers, xml });
		const result = parser.toJson(response.body, { object: true, sanitize: true, trim: true })["s:Envelope"]["s:Body"];
		return !result["s:Fault"];
	} catch (err) {
		console.log("Error in assignedDefaultTranslator");
		console.log(err);
		throw new Error(err.message);
	}
};

async function createMemoqProjectWithTemplate(projectData) {
	const targets = projectData.targets.reduce((acc, cur) => acc + `<arr:string>${ cur.memoq }</arr:string>\n`, '');
	const xml = `${ xmlHeader }
                <soapenv:Body>
                <ns:CreateProjectFromTemplate>
                <ns:createInfo>
                    <ns:Client>${ projectData.customerName }</ns:Client>
                    <ns:CreatorUser>${ projectData.creatorUserId }</ns:CreatorUser>
                    <ns:Domain>${ projectData.industry }</ns:Domain>
                    <ns:Name>[PngSys] ${ projectData.projectName }</ns:Name>
                    <ns:Project>[PngSys] ${ projectData.projectName }</ns:Project>
                    <ns:SourceLanguageCode>${ projectData.source.memoq }</ns:SourceLanguageCode>
                    <ns:TargetLanguageCodes>${ targets }</ns:TargetLanguageCodes>
                    <ns:TemplateGuid>${ projectData.template }</ns:TemplateGuid>
                </ns:createInfo>
                </ns:CreateProjectFromTemplate>
            </soapenv:Body>
            </soapenv:Envelope>`
	const headers = headerWithoutAction('CreateProjectFromTemplate');
	try {
		const { response } = await soapRequest({ url, headers, xml });
		const result = parser.toJson(response.body, { object: true, sanitize: true, trim: true })["s:Envelope"]["s:Body"];
		const projectId = result ? result.CreateProjectFromTemplateResponse.CreateProjectFromTemplateResult.ProjectGuid : "";
		return projectId;
	} catch (err) {
		console.log("Error in createMemoqProjectWithTemplate");
		console.log(err);
		throw new Error(err.message);
	}
}

async function moveMemoqFileToProject(fileId) {
	const xml = `${ xmlHeader }
                <soapenv:Body>
                    <ns:ImportTranslationDocument>
                    <ns:serverProjectGuid>64bdde18-653c-ea11-90ec-9b40ebd15eb0</ns:serverProjectGuid>
                    <ns:fileGuid>${ fileId }</ns:fileGuid>
                    </ns:ImportTranslationDocument>
                </soapenv:Body>
                </soapenv:Envelope>`
	const headers = headerWithoutAction('ImportTranslationDocument');
	try {
		const { response } = await soapRequest({ url, headers, xml, timeout: 480000 });
		const result = parser.toJson(response.body, { object: true, sanitize: true, trim: true });
		return result;
	} catch (err) {
		console.log("Error in moveMemoqFileToProject");
		console.log(err);
		throw new Error(err.message);
	}
}

async function updateMemoqProjectUsers(steps) {

	//NEWER WORK??
	const stepsStatuses = ["Ready to Start", "Waiting to Start", "Started", "Completed"];
	const wordsUnitSteps = steps.filter(item => item.serviceStep.calculationUnit === 'Words' && stepsStatuses.indexOf(item.status) !== -1);
	const splittedByIdSteps = wordsUnitSteps.reduce((acc, cur) => {
		acc[cur.memoqProjectId] = acc[cur.memoqProjectId] ? [...acc[cur.memoqProjectId], cur] : [cur];
		return acc;
	}, {})
	try {
		if(wordsUnitSteps.length) {
			for (let id in splittedByIdSteps) {
				const error = await setMemoqTranlsators(id, splittedByIdSteps[id]);
				if(error) throw error;
			}
		}
	} catch (err) {
		console.log(err);
		console.log("Error in updateMemoqProjectUsers");
		throw new Error(err.message);
	}
}

async function getProjectUsers(projectId) {
	const xml = `${ xmlHeader }
                <soapenv:Body>
                    <ns:ListProjectUsers>
                        <ns:serverProjectGuid>${ projectId }</ns:serverProjectGuid>
                    </ns:ListProjectUsers>
                </soapenv:Body>
            </soapenv:Envelope>`
	const headers = headerWithoutAction('ListProjectUsers');
	try {
		const { response } = await soapRequest({ url, headers, xml });
		const result = parser.toJson(response.body, { object: true, sanitize: true, trim: true })["s:Envelope"]["s:Body"].ListProjectUsersResponse;
		return !result.ListProjectUsersResult ? null : result.ListProjectUsersResult.ServerProjectUserInfoHeader;
	} catch (err) {
		console.log("Error in getProjectUsers");
		console.log(err);
		throw new Error(err.message);
	}
}

async function setMemoqTranlsators(memoqProjectId, steps) {
	try {
		const users = await getMemoqUsers();
		const currentUsers = await getProjectUsers(memoqProjectId);
		const pm = Array.isArray(currentUsers) ? currentUsers.find(item => item.ProjectRoles["a:ProjectManager"]) : currentUsers;


		const assignedSteps = steps.filter(item => item.vendor);
		let projectUsers = assignedSteps.map(item => {
			const memoqUser = users.find(user => user.email === item.vendor.email);
			if(!memoqUser) throw new Error(`No such memoq user - ${ item.vendor.firstName } ${ item.vendor.surname }`);
			return { id: memoqUser.id, isPm: false };
		});
		projectUsers.unshift({ id: pm.User.UserGuid, isPm: true });
		const areUsersSet = await setMemoqProjectUsers(
				memoqProjectId,
				Array.from(new Set(projectUsers.filter((el, i, self) => self.map(item => item.id).indexOf(el.id) === i)))
		);
		return areUsersSet ? await assignMemoqTranslators({ memoqProjectId, assignedSteps, users })
				: new Error("Can't set one or all users in memoQ");
	} catch (err) {
		console.log(err);
		console.log("Error in setMemoqTranslators");
		throw new Error(err.message);
	}
}

async function assignMemoqTranslators({ memoqProjectId, assignedSteps, users }) {
	const docsInfo = assignedSteps.reduce((acc, cur) => {
		const user = users.filter(user => typeof user.email === 'string').find(item => item.email === cur.vendor.email);
		if(user) {
			for (let docId of cur.memoqDocIds) {
				acc[docId] = acc[docId] || {};
				let users = acc[docId].users || [];
				users.push({
					deadline: cur.deadline,
					memoqRole: cur.serviceStep.memoqAssignmentRole,
					userId: user.id
				});
				acc[docId].users = users;
			}
		}
		return acc;
	}, {});
	try {
		await setMemoqDocsAssignments(memoqProjectId, docsInfo);
	} catch (err) {
		console.log(err);
		console.log("Error in assignMemoqTranslators");
		throw new Error(err.message);
	}
}

async function setMemoqProjectUsers(projectId, users) {
	const usersInfo = getUsersInfo(users);
	const xml = `${ xmlHeader }
                <soapenv:Body>
                <ns:SetProjectUsers>
                    <ns:serverProjectGuid>${ projectId }</ns:serverProjectGuid>
                    <ns:userInfos>${ usersInfo }</ns:userInfos>
                </ns:SetProjectUsers>
                </soapenv:Body>
            </soapenv:Envelope>`;
	const headers = headerWithoutAction('SetProjectUsers');
	try {
		const { response } = await soapRequest({ url, headers, xml });
		const result = parser.toJson(response.body, { object: true, sanitize: true, trim: true })["s:Envelope"]["s:Body"];
		return !result["s:Fault"];
	} catch (err) {
		console.log("Error in setMemoqProjectUsers");
		console.log(err);
		throw new Error(err.message);
	}
}

function getUsersInfo(users) {
	const userInfoXml = (user) => `<ns:ServerProjectUserInfo>
                                <ns:PermForLicense>true</ns:PermForLicense>
                                <ns:ProjectRoles>
                                    <mem:ProjectManager>${ user.isPm }</mem:ProjectManager>
                                    <mem:Terminologist>false</mem:Terminologist>
                                </ns:ProjectRoles>
                                <ns:UserGuid>${ user.id }</ns:UserGuid>
                            </ns:ServerProjectUserInfo>\n`;
	return users.reduce((acc, cur) => acc + userInfoXml(cur), "")
}

async function setMemoqDocsAssignments(projectId, docsInfo) {
	const docsUserAssignments = Object.keys(docsInfo).reduce((acc, cur) => {
		const docRoleAssignments = getDocRoleAssignments({ docId: cur, users: docsInfo[cur].users });
		return acc + docRoleAssignments;
	}, "");
	const xml = `${ xmlHeader }
            <soapenv:Body>
                <ns:SetProjectTranslationDocumentUserAssignments>
                    <ns:serverProjectGuid>${ projectId }</ns:serverProjectGuid>
                    <ns:assignments>${ docsUserAssignments }</ns:assignments>
                </ns:SetProjectTranslationDocumentUserAssignments>
            </soapenv:Body>
            </soapenv:Envelope>`;
	const headers = headerWithoutAction('SetProjectTranslationDocumentUserAssignments');
	try {
		const { response } = await soapRequest({ url, headers, xml });
		const result = parser.toJson(response.body, { object: true, sanitize: true, trim: true })["s:Envelope"]["s:Body"];
		return !result["s:Fault"];
	} catch (err) {
		console.log("Error in setMemoqDocsAssignments");
		console.log(err);
		throw new Error(err.message);
	}
}

async function setMemoqDocsDeadline(memoqProjectId, documentGuid, structure) {
	const xml = `${ xmlHeader }
	            <soapenv:Body>
	                <ns:SetProjectTranslationDocumentUserAssignments>
	                    <ns:serverProjectGuid>${ memoqProjectId }</ns:serverProjectGuid>
							          <ns:assignments>
													<ns:ServerProjectTranslationDocumentUserAssignments>
										           <ns:DocumentGuid>${documentGuid}</ns:DocumentGuid>
										           <ns:UserRoleAssignments>
																	${structure}
										           </ns:UserRoleAssignments>
										        </ns:ServerProjectTranslationDocumentUserAssignments>
							         </ns:assignments>
	                </ns:SetProjectTranslationDocumentUserAssignments>
	            </soapenv:Body>
            </soapenv:Envelope>`;
	const headers = headerWithoutAction('SetProjectTranslationDocumentUserAssignments');
	try {
		const { response } = await soapRequest({ url, headers, xml });
		const result = parser.toJson(response.body, { object: true, sanitize: true, trim: true })["s:Envelope"]["s:Body"];
		return !result["s:Fault"];
	} catch (err) {
		console.log("Error in setMemoqDocsDeadline");
		console.log(err);
		throw new Error(err.message);
	}
}

function getDocRoleAssignments(obj) {
	const roles = obj.users ? getRoles(obj.users) : "";
	return `<ns:ServerProjectTranslationDocumentUserAssignments>
            <ns:DocumentGuid>${ obj.docId }</ns:DocumentGuid>
            <ns:UserRoleAssignments>${ roles }</ns:UserRoleAssignments>
        </ns:ServerProjectTranslationDocumentUserAssignments>\n`
}

function getRoles(users) {
	return users.reduce((acc, cur) => {
		return acc + `<ns:TranslationDocumentUserRoleAssignment>
                <ns:DeadLine>${ cur.deadline }</ns:DeadLine>
                <ns:DocumentAssignmentRole>${ cur.memoqRole }</ns:DocumentAssignmentRole>
                <ns:UserGuid>${ cur.userId }</ns:UserGuid>
            </ns:TranslationDocumentUserRoleAssignment>\n`
	}, '')
}

async function getProjectTranslationDocs(projectId) {
	const xml = `${ xmlHeader }
                <soapenv:Body>
                <ns:ListProjectTranslationDocuments>
                    <ns:serverProjectGuid>${ projectId }</ns:serverProjectGuid>
                </ns:ListProjectTranslationDocuments>
                </soapenv:Body>
            </soapenv:Envelope>`;
	const headers = headerWithoutAction('ListProjectTranslationDocuments');
	try {
		const { response } = await soapRequest({ url, headers, xml });
		const result = parser.toJson(response.body, { object: true, sanitize: true, trim: true })["s:Envelope"]["s:Body"].ListProjectTranslationDocumentsResponse;
		return !result.ListProjectTranslationDocumentsResult ? null : result.ListProjectTranslationDocumentsResult.ServerProjectTranslationDocInfo;
	} catch (err) {
		console.log("Error in getProjectTranslationDocs");
		console.log(err);
		throw new Error(err.message);
	}
}

async function getProjectAnalysis(projectId) {
	const xml = `${ xmlHeader }
                <soapenv:Body>
                <ns:RunAnalysis>
                    <ns:serverProjectGuid>${ projectId }</ns:serverProjectGuid>
                    <ns:options>
                        <ns:RepetitionPreferenceOver100>false</ns:RepetitionPreferenceOver100>
                        <ns:StoreReportInProject>false</ns:StoreReportInProject>
                        <ns:TagWeightChar>0</ns:TagWeightChar>
                        <ns:TagWeightWord>0</ns:TagWeightWord>
                    </ns:options>
                </ns:RunAnalysis>
                </soapenv:Body>
            </soapenv:Envelope>`;
	const headers = headerWithoutAction('RunAnalysis');
	try {
		const { response } = await soapRequest({ url, headers, xml });
		const result = parser.toJson(response.body, {
			object: true,
			sanitize: true,
			trim: true
		})["s:Envelope"]["s:Body"].RunAnalysisResponse;
		return !result || result.RunAnalysisResult.ResultStatus !== 'Success' ? null : result.RunAnalysisResult.ResultsForTargetLangs;
	} catch (err) {
		console.log("Error in getProjectAnalysis");
		console.log(err);
		throw new Error(err.message);
	}
}

async function setMemoqDocumentWorkFlowStatus(projectGuid, documentGuid, workFlowStatus) {
	const xml = `${ xmlHeader }
                <soapenv:Body>
	                <ns:SetDocumentWorkflowStatus>
	                   <ns:serverProjectGuid>${ projectGuid }</ns:serverProjectGuid>
						         <ns:workflowChanges>
						            <ns:ServerProjectTranslationDocumentWorkflowStatusChange>
						               <ns:DocumentGuid>${ documentGuid }</ns:DocumentGuid>
						               <ns:WorkflowStatus>${ workFlowStatus }</ns:WorkflowStatus>
						            </ns:ServerProjectTranslationDocumentWorkflowStatusChange>
						         </ns:workflowChanges>
	                </ns:SetDocumentWorkflowStatus>
                </soapenv:Body>
            </soapenv:Envelope>`;
	const headers = headerWithoutAction('SetDocumentWorkflowStatus');
	try {
		const { response } = await soapRequest({ url, headers, xml });
		const result = parser.toJson(response.body, { object: true, sanitize: true, trim: true })["s:Envelope"]["s:Body"];
		return !result["s:Fault"];
	} catch (err) {
		console.log("Error in setMemoqDocStatus");
		console.log(err);
		throw new Error(err.message);
	}
};

async function setMemoqDocStatus({ projectId, docIds, status }) {
	const docStatusInfo = getDocStatusInfo(docIds, status);
	const xml = `${ xmlHeader }
                <soapenv:Body>
                <ns:SetDocumentWorkflowStatus>
                    <ns:serverProjectGuid>${ projectId }</ns:serverProjectGuid>
                    <ns:workflowChanges>${ docStatusInfo }</ns:workflowChanges>
                </ns:SetDocumentWorkflowStatus>
                </soapenv:Body>
            </soapenv:Envelope>`;
	const headers = headerWithoutAction('SetDocumentWorkflowStatus');
	try {
		const { response } = await soapRequest({ url, headers, xml });
		const result = parser.toJson(response.body, { object: true, sanitize: true, trim: true })["s:Envelope"]["s:Body"];
		return !result["s:Fault"];
	} catch (err) {
		console.log("Error in setMemoqDocStatus");
		console.log(err);
		throw new Error(err.message);
	}
}

function getDocStatusInfo(docIds, status) {
	docIds.reduce((acc, cur) => {
		return acc + `<ns:ServerProjectTranslationDocumentWorkflowStatusChange>
            <ns:DocumentGuid>${ cur }</ns:DocumentGuid>
            <ns:WorkflowStatus>${ status }</ns:WorkflowStatus>
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
	} catch (err) {
		console.log(err);
		console.log("Error in cancelMemoqDocs");
		throw new Error(err.message);
	}
}

async function unassignMemoqDocs(memoqDocs) {
	try {
		for (let key in memoqDocs) {
			const docsInfo = memoqDocs[key].reduce((acc, cur) => {
				return { ...acc, [cur.DocumentGuid]: "" }
			}, {})
			await setMemoqDocsAssignments(key, docsInfo);
		}
	} catch (err) {
		console.log(err);
		console.log("Error in unassignMemoqDocs");
		throw new Error(err.message);
	}
}

async function setCancelledNameInMemoq(tasks, projectName) {
	let diffCounter = 0;
	const names = tasks.reduce((acc, cur) => {
		const { memoqProjectId } = cur;
		if(!acc[memoqProjectId]) {
			const name = diffCounter ? `${ projectName }-${ diffCounter }` : projectName;
			acc[memoqProjectId] = name;
			diffCounter++;
		}
		return acc;
	}, {})
	try {
		for (const key in names) {
			await renameMemoqProject(key, `${ names[key] } - Cancelled`);
		}

	} catch (err) {
		console.log(err);
		console.log("Error in setCancelledNameInMemoq");
		throw new Error(err.message);
	}
}

async function renameMemoqProject(projectId, name) {
	const xml = `${ xmlHeader }
                <soapenv:Body>
                <ns:RenameProject>
                    <ns:serverProjectGuid>${ projectId }</ns:serverProjectGuid>
                    <ns:newName>[PngSys] ${ name }</ns:newName>
                </ns:RenameProject>
                </soapenv:Body>
            </soapenv:Envelope>`
	const headers = headerWithoutAction('RenameProject');
	try {
		const { response } = await soapRequest({ url, headers, xml });
		const result = parser.toJson(response.body, { object: true, sanitize: true, trim: true })["s:Envelope"]["s:Body"];
		return !result["s:Fault"];
	} catch (err) {
		console.log("Error in renameMemoqProject");
		console.log(err);
		throw new Error(err.message);
	}
}

// async function getMemoqFileId(projectId, docId) {
//     const xml = `${xmlHeader}
//             <soapenv:Body>
//             <ns:ExportTranslationDocumentAsTwoColumnRtf>
//                 <ns:serverProjectGuid>${projectId}</ns:serverProjectGuid>
//                 <ns:docGuid>${docId}</ns:docGuid>
//                 <ns:options>
//                     <ns:ExportComment>true</ns:ExportComment>
//                     <ns:ExportSegmentStatus>false</ns:ExportSegmentStatus>
//                     <ns:ExportTwoTargetColumns>false</ns:ExportTwoTargetColumns>
//                     <ns:SecondTargetColumnEmpty>false</ns:SecondTargetColumnEmpty>
//                 </ns:options>
//             </ns:ExportTranslationDocumentAsTwoColumnRtf>
//             </soapenv:Body>
//         </soapenv:Envelope>`
//     const headers = headerWithoutAction('ExportTranslationDocumentAsTwoColumnRtf');
//     try {
//         const { response } = await soapRequest({url, headers, xml});
//         const result = parser.toJson(response.body, {object: true, sanitize: true, trim: true})["s:Envelope"]["s:Body"];
//         return !result["s:Fault"] ?
//             result.ExportTranslationDocumentAsTwoColumnRtfResponse.ExportTranslationDocumentAsTwoColumnRtfResult.FileGuid : false;
//     } catch(err) {
//         console.log("Error in getMemoqFileId");
//         console.log(err);
//     }
// }


async function listAnalysisReports(projectId) {
	const xml = `${ xmlHeader }
                <soapenv:Body>
						      <ns:ListAnalysisReports>
						         <ns:serverProjectGuid>${projectId}</ns:serverProjectGuid>
						      </ns:ListAnalysisReports>
                </soapenv:Body>
            </soapenv:Envelope>`
	const headers = headerWithoutAction('ListAnalysisReports');
	try {
		const { response } = await soapRequest({ url, headers, xml });
		const result = parser.toJson(response.body, { object: true, sanitize: true, trim: true })["s:Envelope"]["s:Body"];
		return result.ListAnalysisReportsResponse.ListAnalysisReportsResult.AnalysisReportInfo
	} catch (err) {
		console.log("Error in listAnalysisReports");
		console.log(err);
		return []
		// throw new Error(err.message);
	}
}

async function getAnalysisReportData(projectId, reportId) {
	const xml = `${ xmlHeader }
                <soapenv:Body>
                      <ns:GetAnalysisReportData>
							         <ns:serverProjectGuid>${projectId}</ns:serverProjectGuid>
							         <ns:reportId>${reportId}</ns:reportId>
							      </ns:GetAnalysisReportData>
                </soapenv:Body>
            </soapenv:Envelope>`
	const headers = headerWithoutAction('GetAnalysisReportData');
	try {
		const { response } = await soapRequest({ url, headers, xml });
		const result = parser.toJson(response.body, { object: true, sanitize: true, trim: true })["s:Envelope"]["s:Body"];
		return result.GetAnalysisReportDataResponse.GetAnalysisReportDataResult.ResultsForTargetLangs
	} catch (err) {
		console.log("Error in GetAnalysisReportData");
		console.log(err);
		throw new Error(err.message);
	}
}

async function getMemoqFileId(projectId, docId) {
	const xml = `${ xmlHeader }
            <soapenv:Body>
            <ns:ExportTranslationDocumentAsRtfBilingual>
                <ns:serverProjectGuid>${ projectId }</ns:serverProjectGuid>
                <ns:docGuid>${ docId }</ns:docGuid>
                <ns:options>
                    <ns:SegmentedContextEmptyTranslation>true</ns:SegmentedContextEmptyTranslation>
                    <ns:SuppressContext>true</ns:SuppressContext>
                </ns:options>
            </ns:ExportTranslationDocumentAsRtfBilingual>
            </soapenv:Body>
        </soapenv:Envelope>`
	const headers = headerWithoutAction('ExportTranslationDocumentAsRtfBilingual');
	try {
		const { response } = await soapRequest({ url, headers, xml });
		const result = parser.toJson(response.body, { object: true, sanitize: true, trim: true })["s:Envelope"]["s:Body"];
		if(!result["s:Fault"]) {
			const isError = result.ExportTranslationDocumentAsRtfBilingualResponse.ExportTranslationDocumentAsRtfBilingualResult.ResultStatus === "Error";
			if(isError) throw new Error("It is impossible to get a target file!");
			return result.ExportTranslationDocumentAsRtfBilingualResponse.ExportTranslationDocumentAsRtfBilingualResult.FileGuid;
		} else {
			throw new Error(result["s:Fault"]);
		}
	} catch (err) {
		console.log("Error in getMemoqFileId");
		console.log(err);
		throw new Error(err.message);
	}
}

async function getMemoqFileIdNativeFormat(projectId, docId) {
    const xml = `${xmlHeader}
            <soapenv:Body>
            <ns:ExportTranslationDocument>
                <ns:serverProjectGuid>${projectId}</ns:serverProjectGuid>
                <ns:docGuid>${docId}</ns:docGuid>
            </ns:ExportTranslationDocument>
            </soapenv:Body>
        </soapenv:Envelope>`
    const headers = headerWithoutAction('ExportTranslationDocument');
    try {
        const { response } = await soapRequest({url, headers, xml});
        const result = parser.toJson(response.body, {object: true, sanitize: true, trim: true})["s:Envelope"]["s:Body"];
        if(!result["s:Fault"]) {
            const isError = result.ExportTranslationDocumentResponse.ExportTranslationDocumentResult.ResultStatus === "Error";
            if(isError) throw new Error("It is impossible to get a target file!");
            return result.ExportTranslationDocumentResponse.ExportTranslationDocumentResult.FileGuid;
        } else {
            throw new Error(result["s:Fault"]);
        }
    } catch(err) {
        console.log("Error in getMemoqFileIdNativeFormat");
        console.log(err);
        throw new Error(err.message);
    }
}

async function documentsWithMetrics(documents, ServerProjectGuid){
	let reportsIds = await listAnalysisReports(ServerProjectGuid)

	if(documents.every(item => item.hasOwnProperty('metrics'))) return documents
	if(!Array.isArray(reportsIds)) reportsIds = [reportsIds]

	const [firstElem] = reportsIds
	if(firstElem === undefined){
		for (let i = 0; i < documents.length; i++) {
			documents[i].metrics = getMemoqMetricsForUndefinedDocuments(documents[i].WeightedWords)
		}
		return  documents
	}

	let preTranslationIds = reportsIds
			.filter(({CreatedBy}) => CreatedBy === '*pre-translation*')
			.map(({ID}) => ID )

	if (!preTranslationIds.length){
		preTranslationIds = reportsIds
				.filter(({CreatedBy}) => CreatedBy)
				.map(({ID}) => ID)
	}

	const totalArrayOfDocuments = await preTranslationIds
			.reduce(async (acc, curr) => {
				const { AnalysisResultForLang } = await getAnalysisReportData(ServerProjectGuid, curr)
				if(AnalysisResultForLang) (await acc).push(AnalysisResultForLang)
				return acc
			}, [])

	let AnalysisResultForEachDocument = _.flatten(totalArrayOfDocuments)
			.map(({ByDocument}) => ByDocument.AnalysisReportForDocument)

	if (AnalysisResultForEachDocument.some(item => Array.isArray(item))){
		AnalysisResultForEachDocument = _.flatten(AnalysisResultForEachDocument)
	}

	for (let i = 0; i < documents.length; i++) {
		const docMetrics = AnalysisResultForEachDocument
				.find(item => item.DocumentGuid === documents[i].DocumentGuid)

		if(docMetrics){
			const { Summary } = docMetrics;
			const metrics = Object.keys(Summary).reduce((acc, cur) => {
				const { SourceWordCount } = Summary[cur];
				return cur !== 'Fragments' ? { ...acc, [cur]: +SourceWordCount } : acc
			}, {});
			documents[i].metrics = getMemoqMetrics(metrics)
		}else{
			documents[i].metrics = getMemoqMetricsForUndefinedDocuments(documents[i].WeightedWords)
		}
	}

	return documents
}

async function updateMemoqProjectsData(allProjects) {
	const clients = await Clients.find();
	const vendors = await Vendors.find();
	const allProjectsInSystem = await MemoqProject.find();
	const mappedProjectGuid = allProjects.map(({ serverProjectGuid }) => serverProjectGuid)

	for (let project of allProjectsInSystem) {
		let { _id, documents, serverProjectGuid } = project
		if(!mappedProjectGuid.includes(serverProjectGuid)) return

		documents = await documentsWithMetrics(documents, serverProjectGuid)

		project = checkProjectStructure(clients, vendors, project, documents) ?
				await createOtherProjectFinanceData({ project: project, documents }, true) :
				project;
		project.documents = documents
		await MemoqProject.updateOne({ _id: _id }, project)
	}
}

async function downloadFromMemoqProjectsData() {
	let allProjects = await getMemoqAllProjects();
	try {
		const languages = await Languages.find({}, { lang: 1, symbol: 1, memoq: 1, xtm: 1, iso: 1, iso2: 1 });
		const allProjectsInSystem = await MemoqProject.find();

		for (let project of allProjects) {
			const { ServerProjectGuid } = project;
			let documents = await getProjectTranslationDocs(ServerProjectGuid);
			if(project.Name.indexOf('PngSys') === -1 && !!documents) {
				const isProjectExistInSystem = allProjectsInSystem.map(({ serverProjectGuid }) => serverProjectGuid).includes(ServerProjectGuid);
				let users = await getProjectUsers(ServerProjectGuid);
				users = getUpdatedUsers(users);
				let memoqProject = getMemoqProjectData(project, languages, isProjectExistInSystem);

				await MemoqProject.updateOne({ serverProjectGuid: ServerProjectGuid }, { ...memoqProject, users, documents }, { upsert: true })
			}
		}

	} catch (err) {
		console.log('Error in downloadFromMemoqProjectsData');
		console.log(err);
		throw new Error(err.message);
	} finally {
		await clearGarbageProjects(true);
		await updateMemoqProjectsData(allProjects)
	}
}

function getUpdatedUsers(users) {
	if(Array.isArray(users)) {
		return users.map(item => {
			const isPm = item.ProjectRoles['a:ProjectManager'] === 'true';
			const isTerminologist = item.ProjectRoles['a:Terminologist'] === 'true';
			return {
				...item,
				ProjectRoles: { isPm, isTerminologist }
			};
		});
	}
	const isPm = users.ProjectRoles['a:ProjectManager'] === 'true';
	const isTerminologist = users.ProjectRoles['a:Terminologist'] === 'true';
	return {
		...users,
		ProjectRoles: { isPm, isTerminologist }
	};
}


let sameProjectDates = [];

function getMemoqProjectData(project, languages, isProjectExistInSystem) {
	const sourceLanguage = languages.find(item => item.memoq === project.SourceLanguageCode);
	const targetCodes = typeof project.TargetLanguageCodes['a:string'] === 'string' ? [project.TargetLanguageCodes['a:string']] : project.TargetLanguageCodes['a:string'];
	const targetLanguages = targetCodes.map(item => languages.find(lang => findLanguageByMemoqLanguageCode(lang, item)));

	const obj = {
		name: detectProjectName(),
		creatorUser: project.CreatorUser,
		creationTime: new Date(project.CreationTime),
		deadline: new Date(project.Deadline),
		serverProjectGuid: project.ServerProjectGuid,
		domain: typeof project.Domain === 'string' ? project.Domain : 'Finance',
		client: typeof project.Client === 'string' ? project.Client : '',
		sourceLanguage,
		targetLanguages,
		totalWordCount: project.TotalWordCount,
		projectStatus: project.ProjectStatus,
		weightedWords: project.WeightedWords,
		documentStatus: project.DocumentStatus,
	};
	const additionalObj = {
		status: defineProjectStatus(project.DocumentStatus),
		lockedForRecalculation: false,
		isTest: false,
		isInLQAReports: false,
	};

	return isProjectExistInSystem ? obj : Object.assign(obj, additionalObj);

	function detectProjectName() {
		const { Name, CreationTime } = project;
		if(/(\d.*[\d]] -)/gm.exec(Name) === null) {
			const date = moment(CreationTime).format('YYYY MM DD');
			const pushState = () => sameProjectDates.push(date);
			const clearState = () => sameProjectDates = [];
			!sameProjectDates.length ? pushState() : sameProjectDates.includes(date) ? pushState() : (clearState(), pushState());
			const numberToday = sameProjectDates.length < 10 ? `[0${ sameProjectDates.length }]` : `[${ sameProjectDates.length }]`;
			return `WP ${ date } ${ numberToday } - ${ project.Name }`;
		}
		return project.Name || 'Untitled project';
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
	getMemoqFileIdNativeFormat,
	cancelMemoqDocs,
	setCancelledNameInMemoq,
	downloadFromMemoqProjectsData,
	assignMemoqTranslators,
	setMemoqDocumentWorkFlowStatus,
	assignedDefaultTranslator,
	documentsWithMetrics,
	setMemoqDocsDeadline
}
