const { ImapFlow } = require('imapflow');
const { google } = require('googleapis');

class EmailConnector {
  constructor(provider, credentials) {
    this.provider = provider;
    this.credentials = credentials;
  }

  async connect() {
    switch(this.provider) {
      case 'gmail':
        return this._connectGmail();
      case 'imap':
        return this._connectIMAP();
      case 'outlook':
        return this._connectOutlook();
    }
  }

  async _connectGmail() {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oAuth2Client.setCredentials(this.credentials);
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    return gmail.users.watch({
      userId: 'me',
      requestBody: {
        labelIds: ['INBOX'],
        topicName: 'projects/your-project/topics/gmail-notifications'
      }
    });
  }

  async _connectIMAP() {
    const client = new ImapFlow({
      host: this.credentials.host,
      port: this.credentials.port,
      secure: true,
      auth: {
        user: this.credentials.email,
        pass: this.credentials.password
      }
    });
    await client.connect();
    return client;
  }
}