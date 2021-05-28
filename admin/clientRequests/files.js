const { ClientRequest } = require('../models')
const { moveFile } = require('../utils/movingFile')
const fs = require('fs')
const rimraf = require('rimraf')

// async function removeClientRequest(_id) {
//     try {
//         await ClientRequest.deleteOne({_id});
//         return new Promise((resolve, reject) => {
//             rimraf(`./dist/reqfiles/${_id}`, (err) => {
//                 if(err) reject(err);
//                 resolve("done");
//             })
//         })
//     } catch(err) {
//         console.log(err);
//         console.log("Error in removeClientRequest");
//     }
// }

async function storeRequestFiles(filesArr, requestId) {
	try {
		let storedFiles = []
		if (filesArr.length) {
			for (let file of filesArr) {
				const additionalName = `${ Math.floor(Math.random() * 1000000) }-${ file.filename.replace(/\s+/g, '_') }`
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
				const additionalName = `${ Math.floor(Math.random() * 1000000) }-${ file.filename.replace(/\s+/g, '_') }`
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
		const newFileName = `${Math.floor(Math.random() * 1000000)}-${originalName}`

		fs.copyFile(`./dist/requestFiles/${requestId}/${originalName}`, `./dist/requestFiles/${requestId}/${newFileName}`, (err) => {
			if (err) throw err;
		});

		acc.push({ fileName: newFileName, path: `/projectFiles/${requestId}/${newFileName}`, })

		return acc
	}, [])
}

// async function addRequestFile({request, files, existingFile, prop}) {
//     try {
//         let requestFiles = request[prop];
//         const storedFiles = await storeRequestFiles(files, request.id);
//         requestFiles.push(...storedFiles);
//         if(existingFile.fileName) {
//             await deleteOldFile(`./dist${existingFile.path}`);
//             return requestFiles.filter(item => item.path !== existingFile.path);
//         }
//         return requestFiles;
//     } catch(err) {
//         console.log(err);
//         console.log("Error in addRequestFile");
//     }
// }

// async function removeRequestFiles(removingFiles, requestFiles) {
//     const removingPaths = removingFiles.map(item => item.path);
//     try {
//         for(let file of removingFiles) {
//             await deleteOldFile(`./dist${file.path}`);
//         }
//         return requestFiles.filter(item => removingPaths.indexOf(item.path) === -1);
//     } catch(err) {
//         console.log(err);
//         console.log("Error in removeRequestFiles");
//     }
// }

// async function removeRequestFile({path, files}) {
//     try {
//         await deleteOldFile(`./dist${path}`);
//         return files.filter(item => item.path !== path);
//     } catch(err) {
//         console.log(err);
//         console.log("Error in removeRequestFile");
//     }
// }

// function deleteOldFile(path) {
//     return new Promise((resolve, reject) => {
//         fs.unlink(path, (err, res) => {
//             if(err) {
//                 reject(err)
//             } else {
//                 resolve(res)
//             }
//         });
//     })
// }

module.exports = {
	storeRequestFiles,
	storeRequestFilesForTasksAndSteps,
	getTaskCopiedFiles,
	// addRequestFile,
	// removeRequestFile,
	// removeRequestFiles,
	// removeClientRequest
}
