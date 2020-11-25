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

const getProjectName = (value, labelName) => {
  switch (labelName) {
    case 'Project Approved':
      return nameForApproved(value);
    case 'Decide on quote':
      return nameForQuote(value);
    case 'Project Closed':
      return nameForClosed(value);
  }

  function nameForApproved(subject) {
    const [id] = subject.match(/(\d.*[\d]])/g);
    const projectName = /[N|n]ame:\s(.*)$/.exec(subject);
    return `${ id } - ${ projectName[1] }`;
  }

  function nameForQuote(subject) {
    const fullProjectName = /:\s(.*)$/.exec(subject);
    return fullProjectName[1];
  }

  function nameForClosed(subject) {
    const fullProjectName = /:\s(.*)$/.exec(subject);
    return fullProjectName[1];
  }
};


module.exports = {
  getNewToken,
  getProjectName,
};
