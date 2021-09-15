const path = require("path")
const fs = require("fs")
const rm = require("rimraf")

const DIR = './dist/vendorReportsFiles/'


const createDir = async (reportId) => {
	if (!fs.existsSync(path.join(DIR))){
		await fs.mkdirSync(path.join(DIR));
	}
	console.log(reportId)
	await fs.mkdirSync(path.join(DIR, reportId))

}

const removeDir = async (reportId) => {
	if (fs.existsSync(path.join(DIR, reportId))){
			rm.sync(path.join(DIR, reportId));
	}
}

module.exports = {createDir, removeDir}