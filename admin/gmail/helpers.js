const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const readline = require('readline');

const getNewToken = (oAuth2Client, tokenPath, callback) => {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
	});
	console.log('Authorize this app by visiting this url:', authUrl);
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	rl.question('Enter the code from that page here: ', (code) => {
		rl.close();
		oAuth2Client.getToken(code, (err, token) => {
			if(err) return console.error('Error retrieving access token', err);
			oAuth2Client.setCredentials(token);
			fs.writeFile(tokenPath, JSON.stringify(token), (err) => {
				if(err) return console.error(err);
				console.log('Token stored to', tokenPath);
			});
			callback(oAuth2Client);
		});
	});
};

module.exports = {
	getNewToken,
};
