const { ClientRequest } = require('../models')
const { moveFile } = require('../utils/movingFile')
const fs = require('fs')
const rimraf = require('rimraf')


async function storeRequestFiles(filesArr, requestId) {
	try {
		let storedFiles = []
		if (filesArr.length) {
			for (let file of filesArr) {
				const additionalName = `${ Math.floor(Math.random() * 1000000) }-${ file.filename.replace(/( *[^\w\.]+ *)+/g, '_') }`
				const newPath = `/requestFiles/${ requestId }/${ additionalName }`
				await moveFile(file, `./dist${ newPath }`)
				storedFiles.push({ path: newPath, filename: additionalName, isCheck: false })
			}
		}
		return storedFiles
	} catch (err) {
		console.log(err)
		console.log('Error in storeFiles')
	}
}

async function storeRequestFilesForTasksAndSteps(filesArr, requestId) {
	try {
		let storedFiles = []
		if (filesArr.length) {
			for (let file of filesArr) {
				const additionalName = `${ Math.floor(Math.random() * 1000000) }-${ file.filename.replace(/( *[^\w\.]+ *)+/g, '_') }`
				const newPath = `/requestFiles/${ requestId }/${ additionalName }`
				await moveFile(file, `./dist${ newPath }`)
				storedFiles.push({ path: newPath, filename: additionalName })
			}
		}
		return storedFiles
	} catch (err) {
		console.log(err)
		console.log('Error in storeFiles')
	}
}

const getTaskCopiedFiles = (requestId, arrFiles) => {
	return arrFiles.reduce((acc, cur) => {
		const originalName = cur.path.split("/").pop()
		const newFileName = `${ Math.floor(Math.random() * 1000000) }-${ originalName }`

		fs.copyFile(`./dist/requestFiles/${ requestId }/${ originalName }`, `./dist/requestFiles/${ requestId }/${ newFileName }`, (err) => {
			if (err) throw err
		})

		acc.push({ filename: newFileName, path: `/requestFiles/${ requestId }/${ newFileName }` })

		return acc
	}, [])
}

const getTaskCopiedFilesFromRequestToProject = (projectId, requestId, arrFiles) => {
	return arrFiles.reduce((acc, cur) => {
		const originalName = cur.path.split("/").pop()
		fs.copyFile(`./dist/requestFiles/${ requestId }/${ originalName }`, `./dist/projectFiles/${ projectId }/${ originalName }`, (err) => {
			if (err) throw err
		})
		acc.push(`./dist/projectFiles/${ projectId }/${ originalName }`)
		return acc
	}, [])
}


module.exports = {
	storeRequestFiles,
	storeRequestFilesForTasksAndSteps,
	getTaskCopiedFiles,
	getTaskCopiedFilesFromRequestToProject,
}
