const mv = require('mv');

const moveFile = (oldFile, newPath) => {
    mv(oldFile.path, newPath, {
      mkdirp: true
    }, (err) => {
      if(err) {
        console.log("Error from Move File: " + err);
      }
    });
    return newPath;
} 

module.exports = moveFile;