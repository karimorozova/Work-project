const { getVendor } = require('./getVendors');
const { Vendors } = require('../../models');
const bcrypt = require('bcryptjs');

async function saveHashedPassword(id, pass) {
    try {
        bcrypt.hash(pass, 10, async (err, hash) => {
            if (err) {
                throw new Error("bcrypt error");
            }
            let hashedPassword = hash;
            await Vendors.updateOne({"_id": id}, { password: hashedPassword })
        })
    } catch(err) {
        console.log(err);
        console.log("Error in saveHashedPassword")
    }
}

module.exports = { saveHashedPassword }