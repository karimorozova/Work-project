const schedule = require("node-schedule");
const moment = require('moment');
const { XtrfLqa } = require('./models');
const { downloadFromMemoqProjectsData } = require("./services/memoqs/projects");
const { downloadMemoqFile } = require("./services/memoqs/files");
const { updateStatusesForOtherProjects, clearGarbageProjects } = require("./services/memoqs/otherProjects");
const { saveOtherProjectStatuses } = require('./gmail');
const { newLangReport } = require('./reports/newLangTierReport');
const { parseAndWriteLQAReport } = require('./reports/newLQAStatusFromFiles');
const { UpdateLQAFromProject, newLQAStatusFromXTRFProjects, updateVendorBenchmarkCost } = require('./reports');

// downloadMemoqFile({memoqProjectId:'1443ab32-fa74-eb11-90ed-82bb18d08256', docId:'4c077bd7-e5e7-46a5-9e4e-2953ab86e913', path:'./dist/max.xlsx'} )
// saveOtherProjectStatuses()
// downloadFromMemoqProjectsData();
// clearGarbageProjects(true);
// updateStatusesForOtherProjects()

schedule.scheduleJob('0 */3 * * *', async () => await scheduleJobBody(downloadFromMemoqProjectsData(), "Download new memoq projects"));

schedule.scheduleJob('30 8,13,18 * * *', async () => await scheduleJobBody(saveOtherProjectStatuses(), "Save project statuses from Gmail API"));
schedule.scheduleJob('40 8,13,18 * * *', async () => await scheduleJobBody(updateStatusesForOtherProjects(), "Save project statuses from Gmail API"));

schedule.scheduleJob('40 0 * * *', async () => await scheduleJobBody(UpdateLQAFromProject(), "Updating LQA reports from projects data"));
schedule.scheduleJob('30 0 * * *', async () => await scheduleJobBody(newLQAStatusFromXTRFProjects(), "Updating LQA reports from MemoqProjects data"));
schedule.scheduleJob('30 23 * * *', async () => await scheduleJobBody(newLangReport(), "Updating lang tier data"));
// schedule.scheduleJob('10 0 * * *', async () => await scheduleJobBody(deleteEmptyOrNotCreatedByManger(), "Updating lang tier data"));
schedule.scheduleJob('30 01 * * *', async () => await scheduleJobBody(updateVendorBenchmarkCost(), "Updating vendor benchmark cost"));


(async () => {
	const countLQAReports = await XtrfLqa.countDocuments();
	if(countLQAReports <= 0) parseAndWriteLQAReport()
})();

const scheduleJobBody = async (fnc, scheduleName) => {
	console.log(
			'\x1b[33m',
			`Start schedule: "${ scheduleName }"`,
			`At: ${ moment(new Date()).format("DD.MM.YYYY, hh:mm:ss") };`,
			'\x1b[0m'
	);
	try {
		await fnc;
	} catch (err) {
		console.log(err.message);
	} finally {
		console.log(
				'\x1b[33m',
				`Finish schedule: "${ scheduleName }"`,
				`At: ${ moment(new Date()).format("DD.MM.YYYY, hh:mm:ss") };`,
				'\x1b[0m'
		);
	}
};
