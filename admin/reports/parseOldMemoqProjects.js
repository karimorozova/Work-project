const fs = require('fs')

const requireFile = () => {
	fs.readFile('../static/oldMemoqProjects/1.xlsx', 'utf8', (err, data) => {
		if(err) {
			console.error(err)
			return
		}
		console.log(data)
	})
}
