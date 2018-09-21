const mv = require('mv');

const moveFile = (oldFile, id, folder) => {
    var newFile = `./dist/${folder}/${id}/${oldFile.filename}`;
    mv(oldFile.path, newFile, {
      mkdirp: true
    }, (err) => {
    });
    return oldFile.filename;
} 

module.exports = moveFile;