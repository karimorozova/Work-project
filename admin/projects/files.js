const { archiveMultipleFiles } = require('../utils/archiving');
const { moveFile } = require('../utils/movingFile');

async function storeFiles(filesArr, projectId) {
    let storedFiles = [];
    if(filesArr.length) {
        for(let file of filesArr) {
            const newPath = `./dist/projectFiles/${projectId}/${file.filename.replace(/\s+/g, '_')}`;
            try {
                await moveFile(file, newPath);
            } catch(err) {
                throw new Error("Error from storeFiels")
            }
            storedFiles.push(newPath);
        }
    }
    return storedFiles;
}

async function getDeliverablesLink({jobs, projectId, taskId}) {
    try {
        const files = getParsedFiles(jobs);
        const outputPath = `./dist/projectFiles/${projectId}/deliverables-${taskId.replace(/\s+/g, '_')}.zip`;
        await archiveMultipleFiles({outputPath, files});
        return outputPath.split("./dist")[1];
    } catch(err) {
        console.log(err);
        console.log("Error in getDeliverablesLink");
    }
}

function getParsedFiles(jobs) {
    return jobs.reduce((prev, cur) => {
        const filePathParts = cur.targetFile.split("/");
        const fileName = filePathParts.slice(-1)[0];
        const file = {path: `./dist${cur.targetFile}`, name: fileName};
        prev.push(file);
        return [...prev];
    }, [])
}

module.exports = { storeFiles, getDeliverablesLink };
