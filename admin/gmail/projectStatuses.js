const { getToken } = require('./authorization');
const { google: { gmail: gmailApi } } = require('googleapis');
const { GmailProjectsStatuses } = require('../models');
const fs = require('fs');
const csv = require('csv-parser');

const wait = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

const saveOtherProjectStatuses = async (auth) => {
	if(!auth) getToken(saveOtherProjectStatuses);
	else {
		const gmail = gmailApi({ version: 'v1', auth });
		await saveAttachmentDataFromMessagesByLabelId(gmail, 'Label_4897832564654206611', 'Quote');
		await wait(10000);
		await saveAttachmentDataFromMessagesByLabelId(gmail, 'Label_1714380902505568051', "In progress");
		await wait(10000);
		await saveAttachmentDataFromMessagesByLabelId(gmail, 'Label_8132819458511673536', "");
		await wait(10000);
		await saveAttachmentDataFromMessagesByLabelId(gmail, 'Label_2632527857332050649', "");
	}
};
const saveAttachmentDataFromMessagesByLabelId = async (gmail, labelId, status) => {
	let allProjectsStatuses = await GmailProjectsStatuses.find();
	// await gmail.users.labels.list({
	// 		userId: 'me',
	// 	},async (err, res) => {
	// 	console.log(res.data.labels.find(item => item.name === 'XTRF Rejected Quotes'));
	// })
	await gmail.users.messages.list({
				userId: 'me',
				labelIds: labelId
			},
			async (err, res) => {
				for (let { id } of res.data.messages.slice(0, 10)) {
					await wait(500);
					await gmail.users.messages.get({
								userId: 'me',
								id: id
							},
							async (err, res) => {
								for (let part of res.data.payload.parts.filter(item => item.body.hasOwnProperty('attachmentId'))) {
									await gmail.users.messages.attachments.get({
												userId: 'me',
												messageId: id,
												id: part.body.attachmentId
											},
											async (err, res) => {
												if(res) {
													fs.writeFile('./dist/emails/File.csv', Buffer.from(res.data.data, 'base64'), (err) => {
														if(err) throw err;
														console.log('successfully file SAVED! for label =>', labelId);
														fs.createReadStream('./dist/emails/File.csv').pipe(csv(
																{ separator: '\t' }
														)).on('data', async (data) => {
															allProjectsStatuses = await callFunctionsByCondition(data, allProjectsStatuses, status);
														}).on('end', () => {
															console.log('successfully file READ! for label =>', labelId);
															// fs.unlink('./dist/emails/File.csv', (err) => {
															// 	if(err) throw err;
															// 	console.log('successfully file DELETED! for label =>', labelId);
															// });
														});
													});
												}
											});
								}
							});
				}
			});

	async function callFunctionsByCondition(data, allProjectsStatuses, status) {
		switch (labelId) {
			case 'Label_8132819458511673536':
				try {
					return allProjectsStatuses = await saveFinalProjectsStatusToDB(data, allProjectsStatuses);
				} catch (e) {
					console.log(e)
				}
				break;
			case 'Label_2632527857332050649':
				try {
					return allProjectsStatuses = await clearRejectedProjects(data, allProjectsStatuses);
				} catch (e) {
					console.log(e)
				}
				break;
			default:
				try {
					return allProjectsStatuses = await saveProjectsStatusToDB(data, allProjectsStatuses, status);
				} catch (e) {
					console.log(e)
				}
				break;
		}
	}
};

const clearRejectedProjects = async (csvStr, allProjectsStatuses) => {
	if(Object.values(csvStr).length) {
		const localAllProjectsStatuses = allProjectsStatuses;
		const [projectId, projectName] = Object.values(csvStr);
		const name = `${ projectId } - ${ projectName }`;
		const idx = localAllProjectsStatuses.findIndex(({ name: n }) => n.trim() === name.trim());
		if(idx !== -1) {
			const { name: idxName } = localAllProjectsStatuses[idx];
			localAllProjectsStatuses.slice(idx, 1);
			await GmailProjectsStatuses.deleteOne({ name: idxName })
		}
		return localAllProjectsStatuses
	}
	return allProjectsStatuses;
};

const saveFinalProjectsStatusToDB = async (csvStr, allProjectsStatuses) => {
	if(Object.values(csvStr).length) {
		let localAllProjectsStatuses = allProjectsStatuses;
		let [projectId, projectName, status] = Object.values(csvStr);
		const newStatus = status === 'Open' ? 'In progress' : 'Closed';
		const name = `${ projectId } - ${ projectName }`;

		const idx = localAllProjectsStatuses.findIndex(({ name: n }) => n && n.trim() === name.trim());
		if(idx !== -1) {
			let currObj = localAllProjectsStatuses[idx];
			currObj.isRead = false;
			currObj.status = newStatus;
			await GmailProjectsStatuses.updateOne({ name: currObj.name.trim() }, currObj);
			localAllProjectsStatuses[idx] = currObj;
		} else {
			localAllProjectsStatuses.push({ name, status });
			await GmailProjectsStatuses.create({ name, status })
		}
		return localAllProjectsStatuses
	}
	return allProjectsStatuses;
};

const saveProjectsStatusToDB = async (csvStr, allProjectsStatuses, status) => {
	if(Object.values(csvStr).length) {
		const localAllProjectsStatuses = allProjectsStatuses;
		const [projectId, projectName] = Object.values(csvStr);
		const name = `${ projectId } - ${ projectName }`;
		const idx = localAllProjectsStatuses.findIndex(({ name: n, status: s }) => n.trim() === name.trim() && s.trim() === status.trim());
		if(idx === -1) {
			localAllProjectsStatuses.push({ name, status });
			await GmailProjectsStatuses.create({ name, status })
		}
		return localAllProjectsStatuses
	}
	return allProjectsStatuses
};


module.exports = {
	saveOtherProjectStatuses,
};
