const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if(!fs.existsSync('./dist/uploads/')){
            fs.mkdirSync('./dist/uploads/');
        }
        cb(null, './dist/uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});
  
const upload = multer({
    storage: storage,
    limits: {fieldSize: 25 * 1024 * 1024}
});

module.exports = upload;