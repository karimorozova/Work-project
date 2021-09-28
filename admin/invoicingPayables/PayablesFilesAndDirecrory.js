const path = require("path")
const fs = require("fs")
const rm = require("rimraf")

const createDir = async (DIR, reportId) => {
	if (!fs.existsSync(path.join(DIR))) await fs.mkdirSync(path.join(DIR))
	if (!fs.existsSync(path.join(DIR, reportId))) await fs.mkdirSync(path.join(DIR, reportId))
}

const removeDir = async (DIR, reportId) => {
	if (fs.existsSync(path.join(DIR, reportId))) {
		rm.sync(path.join(DIR, reportId))
	}
}

module.exports = { createDir, removeDir }