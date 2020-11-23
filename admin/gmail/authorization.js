const fs = require('fs');
const { google } = require('googleapis');
const { getNewToken } = require('./helpers');
const TOKEN_PATH = './gmail/token.json';

const getToken = (callback) => {
  fs.readFile('./gmail/credentials.json', (err, data) => {
    if (err) {
      console.log(err);
      console.log('Error on loading cred file');
    } else {
      const { web: { client_secret, client_id, redirect_uris } } = JSON.parse(data.toString());
      const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, TOKEN_PATH, callback);
        oAuth2Client.setCredentials(JSON.parse(token.toString()));
        callback(oAuth2Client);
      });
    }
  });
};

module.exports = { getToken };
