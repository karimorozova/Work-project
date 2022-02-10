const { LangTest } = require('../models')
const { moveFile } = require('../utils/movingFile')
const { getUpdatedTest } = require('./get')
const fs = require('fs')

async function updateLangTest(langTest, testFile) {
	const { _id, oldPath, ...testData } = langTest
	let path = oldPath
	let { fileName, evaluationType } = testData

	try {
		if (testFile) {
			path = `/langTestsFiles/${ testFile.filename.replace(/\s+/g, '_') }`
			fileName = testFile.filename
			await moveFile(testFile, `./dist${ path }`)
		}
		if (_id) {
			if (evaluationType === "Sample" && path) {
				await getUpdatedTest({ _id }, { ...testData, fileName: "", path: "" })
				return await removeOldFile(path, "")
			} else {
				await getUpdatedTest({ _id }, { ...testData, fileName, path })
				return await removeOldFile(oldPath, path)
			}
		}
		await LangTest.create({ ...testData, fileName, path })
	} catch (err) {
		console.log(err)
		console.log("Error in updateLangTest")
	}
}

async function removeLangTest(_id, path) {
	try {
		await LangTest.deleteOne({ _id })
		await removeOldFile(path, "")
	} catch (err) {
		console.log(err)
		console.log("Error in removeLangTest")
	}
}

function removeOldFile(oldPath, newPath) {
	if (oldPath === newPath || !oldPath) return
	return new Promise((resolve, reject) => {
		fs.unlink(`./dist${ oldPath }`, (err) => {
			if (err) {
				console.log(err)
				console.log("Error in removeOldFile")
				reject(err)
			}
		})
		resolve("removed")
	})
}

module.exports = {
	updateLangTest,
	removeLangTest
}