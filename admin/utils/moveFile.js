const mv = require('mv');

const moveFile = (oldFile, path) => {
    var newFile = `./dist/${path}`;
    mv(oldFile.path, newFile, {
      mkdirp: true
    }, (err) => {
    });
    return newFile;
} 

module.exports = moveFile;