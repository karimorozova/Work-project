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
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      fs.writeFile(tokenPath, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', tokenPath);
      });
      callback(oAuth2Client);
    });
  });
};

const getProjectNameFromQuoteProjectMessage = (messageString) => {
  const projectNameRegex = new RegExp(/(?<=[N-n]ame: ).[^:]\S+/g);
  const projectDateRegex = new RegExp(/[0-9]{4} (0[1-9]|1[0-2]) (0[1-9]|[1-2][0-9]|3[0-1]) \[[0-9]{2}]/g);
  const projectDate = messageString.match(projectDateRegex)[0];
  const projectName = messageString.match(projectNameRegex)[0];
  return `${projectDate} - ${projectName}`;
};

const getProjectNameFromInProgressProjectMessage = () => {

};

const getProjectNameFromClosedProjectMessage = (messageString) => {
  const projectNameRegex = new RegExp(/(?<=project: )((\d|\w).+)[^"]/g);
  return messageString.match(projectNameRegex)[0];
};

module.exports = {
  getNewToken,
  getProjectNameFromQuoteProjectMessage,
  getProjectNameFromInProgressProjectMessage,
  getProjectNameFromClosedProjectMessage
};
