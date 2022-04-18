const path = require("path")
const fs = require("fs")
const rm = require("rimraf")

const createDir = async (pathToDir, dirName) => {
	if (!fs.existsSync(path.join(pathToDir))) await fs.mkdirSync(path.join(pathToDir))
	if (!fs.existsSync(path.join(pathToDir, dirName))) await fs.mkdirSync(path.join(pathToDir, dirName))
}

const removeDir = async (pathToDir, dirName) => {
	if (fs.existsSync(path.join(pathToDir, dirName))) {
		rm.sync(path.join(pathToDir, dirName))
	}
}

module.exports = { createDir, removeDir }