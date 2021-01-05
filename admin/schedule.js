const schedule = require("node-schedule");
const { XtrfLqa } = require('./models');
const { updateMemoqProjectsData } = require("./services/memoqs/projects");
const { saveProjectStatuses, updateOtherProjectStatusOnMessages, filterOldMessages } = require('./gmail');
const { newLangReport } = require('./reports/newLangTierReport');
const { parseAndWriteLQAReport } = require('./reports/newLQAStatusFromFiles');
const { UpdateLQAFromProject, newLQAStatusFromXTRFProjects } = require('./reports');

(async () => {
	const countLQAReports = await XtrfLqa.countDocuments();
	if(countLQAReports <= 0) parseAndWriteLQAReport()
})();


schedule.scheduleJob("0 */3 * * *", async function () {
	const scheduleName = "Updating memoq projects";
	console.log(`✐ Start schedule: ${ scheduleName }`, `${ new Date() };`);
	try {
		await updateMemoqProjectsData();
		console.log(`✔ Finish schedule: ${ scheduleName }`, `${ new Date() };`);
	} catch (err) {
		console.log(err.message);
	}
});

schedule.scheduleJob("0 */1 * * *", async function () {
	const scheduleName = "";
	console.log(`✐ Start schedule: ${ scheduleName }`, `${ new Date() };`);
	try {
		// await saveProjectStatuses();
		console.log(`✔ Finish schedule: ${ scheduleName }`, `${ new Date() };`);
	} catch (err) {
		console.log(err.message);
	}
});

schedule.scheduleJob("0 0 */2 * *", async function () {
	const scheduleName = "";
	console.log(`✐ Start schedule: ${ scheduleName }`, `${ new Date() };`);
	try {
		// await filterOldMessages();
		console.log(`✔ Finish schedule: ${ scheduleName }`, `${ new Date() };`);
	} catch (err) {
		console.log(err.message);
	}
});

schedule.scheduleJob("0 0 */2 * *", async function () {
	const scheduleName = "";
	console.log(`✐ Start schedule: ${ scheduleName }`, `${ new Date() };`);
	try {
		// await updateOtherProjectStatusOnMessages();
		console.log(`✔ Finish schedule: ${ scheduleName }`, `${ new Date() };`);
	} catch (err) {
		console.log(err.message);
	}
});

schedule.scheduleJob('30 23 * * *', async function () {
	const scheduleName = "Updating lang tier data";
	console.log(`✐ Start schedule: ${ scheduleName }`, `${ new Date() };`);
	try {
		await newLangReport();
		console.log(`✔ Finish schedule: ${ scheduleName }`, `${ new Date() };`);
	} catch (err) {
		console.log(err.message);
	}
});

schedule.scheduleJob('30 0 * * *', async function () {
	const scheduleName = "Updating LQA reports from MemoqProjects data";
	console.log(`✐ Start schedule: ${ scheduleName }`, `${ new Date() };`);
	try {
		await newLQAStatusFromXTRFProjects();
		console.log(`✔ Finish schedule: ${ scheduleName }`, `${ new Date() };`);
	} catch (err) {
		console.log(err.message);
	}
});

schedule.scheduleJob('40 0 * * *', async function () {
	const scheduleName = "Updating LQA reports from projects data";
	console.log(`✐ Start schedule: ${ scheduleName }`, `${ new Date() };`);
	try {
		await UpdateLQAFromProject();
		console.log(`✔ Finish schedule: ${ scheduleName }`, `${ new Date() };`);
	} catch (err) {
		console.log(err.message);
	}
});

