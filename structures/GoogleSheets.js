import { google } from 'googleapis';
import googleClient from './GoogleClient';

class GoogleSheets {
    constructor() {
        this.scopes = [ 'https://www.googleapis.com/auth/spreadsheets' ];
        this.sheetID = '1RafqUGGRNmhI4JClHH9qE_BpWe73TfegqHKUyxUQNwk';
        this.sheets = google.sheets( {
            version: 'v4',
            auth: googleClient.oAuth2Client
        } );
    }

    async resourceUpdate( link, description, message ) {
        await googleClient.authenticate( this.scopes, message );

        try {
            this.sheets.spreadsheets.values.append( {
                spreadsheetId: this.sheetID,
                range: 'Sheet1!A1:C1',
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [ [ message.channel.parent.name, link[ 0 ], description ] ]
                }
            } );
        } catch ( err ) {
            return console.error( err );
        }

        message.react( '544264131780411437' );

        return message.guild.channels
            .get( message.settings.botLogChannel )
            .send( ` updated links list, from: ${message.channel.parent.name}**/**${message.channel}.` );
    }
}

export default new GoogleSheets();
