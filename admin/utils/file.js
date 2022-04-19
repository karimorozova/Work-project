const { moveFile } = require("./movingFile")

const storeFile = async (file, _entityId, DIR, options = { isAdditionalFileInfo: true }) => {
	try {
		const additionFileInfo = `${ Math.floor(Math.random() * 100000) }`
		const nativeFileName = file.filename.replace(/( *[^\w\.]+ *)+/g, '_')

		const fileName = options.isAdditionalFileInfo
				? `${ additionFileInfo }-${ nativeFileName }`
				: `${ nativeFileName }`

		const newPath = `/${ DIR }/${ _entityId }/${ fileName }`
		await moveFile(file, './dist' + newPath)

		return { path: newPath, fileName }
	} catch (err) {
		console.log(err)
		console.log("Error with saving new file")
	}
}

const storeFiles = async (filesArr, _entityId, DIR, options = { isAdditionalFileInfo: true }) => {
	try {
		let storedFiles = []
		if (filesArr && filesArr.length) for await (let file of filesArr) {
			const { path, fileName } = await storeFile(file, _entityId, DIR, options)
			storedFiles.push({ path, fileName })
		}

		return storedFiles
	} catch (err) {
		console.log(err)
		console.log("Error with saving new files")
	}
}


module.exports = {
	storeFile,
	storeFiles
}