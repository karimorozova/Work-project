const { xmlHeader, getHeaders } = require("../../configs")
const parser = require('xml2json')
const soapRequest = require('easy-soap-request')
const fs = require('fs')
const { getMemoqFileId, getMemoqFileIdNativeFormat, getMemoqFileIdAsXML } = require("./projects")

const url = `https://memoq.pangea.global:8080/memoQServices/FileManager/FileManagerService`
const headerWithoutAction = getHeaders('IFileManagerService')

async function beginFileUpload(filePath) {
	const xml = `${ xmlHeader }
                <soapenv:Body>
                    <ns:BeginChunkedFileUpload>
                        <ns:fileName>${ filePath }</ns:fileName>
                        <ns:isZipped>false</ns:isZipped>
                    </ns:BeginChunkedFileUpload>
                </soapenv:Body>
                </soapenv:Envelope>`
	const headers = headerWithoutAction('BeginChunkedFileUpload')
	try {
		const { response } = await soapRequest({ url, headers, xml })
		const result = parser.toJson(response.body, { object: true, sanitize: true, trim: true })
		return result["s:Envelope"]["s:Body"].BeginChunkedFileUploadResponse.BeginChunkedFileUploadResult
	} catch (err) {
		console.log(err)
		console.log("Error in beginFileUpload")
		throw new Error(err.message)
	}
}

async function addProjectFile(projectId, filePath) {
	try {
		const fileId = await beginFileUpload(filePath)
		await continueAndFinishUploadFilesToMemoq(fileId, filePath)
		await moveMemoqFileToProject(projectId, fileId)
		return fileId
	} catch (err) {
		console.log(err)
		console.log("Error in addProjectFile")
		throw new Error(err.message)
	}
}

async function continueAndFinishUploadFilesToMemoq(fileId, filePath) {
	try {
		const chunksArr = await getChunks(fileId, filePath)
		const headers = headerWithoutAction('AddNextFileChunk')
		let results = []
		for (let xml of chunksArr) {
			const { response } = await soapRequest({ url, headers, xml })
			results.push(parser.toJson(response.body, { object: true, sanitize: true, trim: true }))
		}
		return await finishMemoqFileMove(fileId, results)
	} catch (err) {
		console.log(err)
		console.log("Error in continueAndFinishUploadFilesToMemoq")
		throw new Error(err.message)
	}
}

function getChunks(fileId, filePath) {
	const readStream = fs.createReadStream(`${ filePath }`, { highWaterMark: 128 * 1024 })
	let chunksArr = []
	return new Promise((resolve, reject) => {
		readStream.on('data', (chunk) => {
			const dataString = chunk.toString('base64')
			const xml = `${ xmlHeader }
                    <soapenv:Body>
                    <ns:AddNextFileChunk>
                        <ns:fileIdAndSessionId>${ fileId }</ns:fileIdAndSessionId>
                        <ns:fileData>${ dataString }</ns:fileData>
                    </ns:AddNextFileChunk>
                    </soapenv:Body>
                </soapenv:Envelope>`
			chunksArr.push(xml)
		})
		readStream.on('error', (err) => {
			console.log(err)
			console.log("Error in getChunks")
			reject(err)
		})
		readStream.on('end', () => {
			resolve(chunksArr)
		})
	})
}

async function finishMemoqFileMove(fileId, results) {
	const xml = `${ xmlHeader }
                <soapenv:Body>
                    <ns:EndChunkedFileUpload>
                        <ns:fileIdAndSessionId>${ fileId }</ns:fileIdAndSessionId>
                    </ns:EndChunkedFileUpload>
                </soapenv:Body>
                </soapenv:Envelope>`
	const headers = headerWithoutAction('EndChunkedFileUpload')
	try {
		const { response } = await soapRequest({ url, headers, xml })
		const result = parser.toJson(response.body, { object: true, sanitize: true, trim: true })
		return { finish: result, addFiles: results }
	} catch (err) {
		console.log(err)
		console.log("Error in finishMemoqFileMove")
		throw new Error(err.message)
	}
}

async function moveMemoqFileToProject(projectId, fileId) {
	const xml = `${ xmlHeader }
                <soapenv:Body>
                    <ns:ImportTranslationDocument>
                    <ns:serverProjectGuid>${ projectId }</ns:serverProjectGuid>
                    <ns:fileGuid>${ fileId }</ns:fileGuid>
                    </ns:ImportTranslationDocument>
                </soapenv:Body>
                </soapenv:Envelope>`
	const url = `https://memoq.pangea.global:8080/memoQServices/ServerProject/ServerProjectService`
	const headers = {
		'Content-Type': 'text/xml;charset=UTF-8',
		'soapAction': 'http://kilgray.com/memoqservices/2007/IServerProjectService/ImportTranslationDocument'
	}
	try {
		const { response } = await soapRequest({ url, headers, xml, timeout: 480000 })
		if (response.statusCode === 200) {
			return parser.toJson(response.body, { object: true, sanitize: true, trim: true })
		}
	} catch (err) {
		console.log(err)
		console.log("Error in moveMemoqFileToProject")
		throw new Error(err.message)
	}
}

async function downloadMemoqFile({ memoqProjectId, docId, path }) {
	try {
		// old file download in different format
		// const fileId = await getMemoqFileId(memoqProjectId, docId);
		const fileId = await getMemoqFileIdNativeFormat(memoqProjectId, docId)
		const sessionId = await exportMemoqFile(fileId)
		await getMemoqFileChunks(sessionId, path)
	} catch (err) {
		console.log(err)
		console.log("Error in downloadMemoqFile")
		throw new Error(err.message)
	}
}

async function downloadMemoqFileXML({ memoqProjectId, DocumentGuid, path }) {
	try {
		const fileId = await getMemoqFileIdAsXML(memoqProjectId, DocumentGuid)
		const sessionId = await exportMemoqFile(fileId)
		await getMemoqFileChunks(sessionId, path)
	} catch (err) {
		console.log(err)
		console.log("Error in downloadMemoqFileXML")
		throw new Error(err.message)
	}
}

async function exportMemoqFile(fileId) {
	const xml = `${ xmlHeader }
                <soapenv:Body>
                <ns:BeginChunkedFileDownload>
                    <ns:fileGuid>${ fileId }</ns:fileGuid>
                    <ns:zip>false</ns:zip>
                </ns:BeginChunkedFileDownload>
                </soapenv:Body>
                </soapenv:Envelope>`
	const headers = headerWithoutAction('BeginChunkedFileDownload')
	try {
		const { response } = await soapRequest({ url, headers, xml })
		const result = parser.toJson(response.body, { object: true, sanitize: true, trim: true })["s:Envelope"]["s:Body"].BeginChunkedFileDownloadResponse
		return result ? result.BeginChunkedFileDownloadResult : new Error()
	} catch (err) {
		console.log(err)
		console.log("Error in exportMemoqFile")
		throw new Error(err.message)
	}
}

async function getMemoqFileChunks(sessionId, path) {
	const xml = `${ xmlHeader }
                    <soapenv:Body>
                    <ns:GetNextFileChunk>
                        <ns:sessionId>${ sessionId }</ns:sessionId>
                        <ns:byteCount>131072</ns:byteCount>
                    </ns:GetNextFileChunk>
                    </soapenv:Body>
                </soapenv:Envelope>`
	const headers = headerWithoutAction('GetNextFileChunk')
	try {
		const writeStream = fs.createWriteStream(path)
		let result = ""
		while (typeof result === 'string') {
			const { response } = await soapRequest({ url, headers, xml })
			result = parser.toJson(response.body, { object: true, sanitize: true, trim: true })["s:Envelope"]["s:Body"].GetNextFileChunkResponse.GetNextFileChunkResult
			if (typeof result === 'string') {
				writeStream.write(Buffer.from(result, 'base64'), (err) => {
					if (err) console.log(err)
				})
			}
		}
		writeStream.on('error', (err) => console.log(err))
		writeStream.on('finish', () => console.log("finished"))
		return sessionId
	} catch (err) {
		console.log(err)
		console.log("Error in getMemoqFileChunks")
	} finally {
		await finishMemoqFileDownload(sessionId)
	}
}

async function finishMemoqFileDownload(sessionId) {
	const xml = `${ xmlHeader }
                <soapenv:Body>
                <ns:EndChunkedFileDownload>
                    <ns:sessionId>${ sessionId }</ns:sessionId>
                </ns:EndChunkedFileDownload>
                </soapenv:Body>
                </soapenv:Envelope>`
	const headers = headerWithoutAction('EndChunkedFileDownload')
	try {
		const { response } = await soapRequest({ url, headers, xml })
		const result = parser.toJson(response.body, { object: true, sanitize: true, trim: true })
		return result
	} catch (err) {
		console.log(err)
		console.log("Error in finishMemoqFileDownload")
		throw new Error(err.message)
	}
}

module.exports = {
	moveMemoqFileToProject,
	addProjectFile,
	exportMemoqFile,
	getMemoqFileChunks,
	downloadMemoqFile,
	downloadMemoqFileXML
}
