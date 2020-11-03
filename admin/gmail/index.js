const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = './gmail/token.json';
const { GmailMessages } = require('../models');

function parseGmailMessages () {
  fs.readFile('./gmail/credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorize(JSON.parse(content), listLabels);
  });

  function authorize (credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getNewToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }

  function getNewToken (oAuth2Client, callback) {
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
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }

  async function listLabels (auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    gmail.users.messages.list({
      userId: 'me',
    }, (err, res) => {
      for (let { id } of res.data.messages) {
        gmail.users.messages.get({
          userId: 'me', id: id
        }, async (err, res) => {
          if (res.data.labelIds.includes('Label_7856034683783598201')) {
            await GmailMessages.create({ id: res.data.id, additionalInformation: { ...res.data } });
          }
        });
      }
    });
  }
}

module.exports = { parseGmailMessages };
