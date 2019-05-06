const fs = require("fs");
const archiver = require("archiver");

const archiveFile = ({outputPath, originFile}) => {
    let output = fs.createWriteStream(outputPath);
    let archive = archiver('zip', {
        zlib: { level: 9 }
    });
    output.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
    });
    output.on('end', function() {
        console.log('Data has been drained');
    });
    archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
            // log warning
        } else {
            throw err;
        }
    });
    archive.on('error', function(err) {
        throw err;
    });
    archive.pipe(output);
    const file = originFile.path;
    archive.append(fs.createReadStream(file), {name: originFile.filename});
    archive.finalize();
}

module.exports ={ archiveFile };