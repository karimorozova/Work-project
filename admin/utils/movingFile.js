const mv = require('mv');
const fs = require('fs');

const moveFile = async (oldFile, newPath) => {
  return await new Promise((resolve, reject) => {
     mv(oldFile.path, newPath, {
      mkdirp: true
    }, (err) => {
      if (err) {
        console.log("Error from Move File: " + err);
        reject(err);
      }
    });
    resolve(newPath);
  })
}

const moveProjectFile = (oldFile, newPath) => {
    return new Promise((resolve, reject) => {
        fs.rename(oldFile.path, newPath, function(err) {
            if(err) {
              console.log("Error from Move File: " + err);
              reject(err);
            }
            resolve(newPath);
        });
    })
}

module.exports = { moveFile, moveProjectFile };