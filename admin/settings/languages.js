const { Languages } = require('../models')
const { moveFile } = require('../utils')
const fs = require('fs')

async function updateLanguage(obj) {
	let { id, icon, flag } = obj
	id = id === 'null' ? null : id
	try {
		if (id) {
			if (!flag) {
				return await Languages.updateOne({ "_id": id }, { icon, ...obj })
			}
			return await updateWithNewIcon()
		}
		return await createWithNewIcon()
	} catch (err) {
		console.log(err)
		console.log("Error in updateLanguage")
	}

	async function createWithNewIcon() {
		const newIcon = await workWithIcon()
		await Languages.create({ "icon": newIcon, ...obj })
	}

	async function updateWithNewIcon() {
		const newIcon = await workWithIcon()
		await Languages.updateOne({ "_id": id }, { "icon": newIcon, ...obj })
		await removeOldIcon(icon)
	}

	async function workWithIcon() {
		delete obj['icon']
		return await moveFlagIcon(flag)
	}
}

async function moveFlagIcon(flag) {
	const date = new Date()
	const formattedDate = `${ date.getDate() }-${ date.getMonth() + 1 }-${ date.getFullYear() }`
	const newPath = `./dist/languages/${ formattedDate }-${ flag[0].filename }`
	try {
		await moveFile(flag[0], newPath)
	} catch (err) {
		console.log(err)
		console.log("Error in moveFile in moveFlagIcon func")
	}
	return `/languages/${ formattedDate }-${ flag[0].filename }`
}

async function removeOldIcon(icon) {
	try {
		await fs.unlink(`./dist${ icon }`, (err) => {
			if (err) console.log("Error on file deleting " + err)
		})
	} catch (err) {
		console.log(err)
		console.log("Error in removeOldIcon func")
	}
}

module.exports = { updateLanguage }