import { google } from 'googleapis';
import fs from 'fs';

class GoogleClient {
    constructor( options ) {
        this._options = options || { scopes: [] };
        this.TOKEN_PATH = 'token.json';
        this.KEY_PATH = 'credentials.json';

        let content;

        try {
            content = fs.readFileSync( this.KEY_PATH, 'utf8' );
        } catch ( err ) {
            return console.log( 'Error loading client secret file:', err );
        }

        // eslint-disable-next-line
		const { client_secret, client_id, redirect_uris } = JSON.parse(content).installed;

        this.oAuth2Client = new google.auth.OAuth2( client_id, client_secret, redirect_uris[ 0 ] ); // eslint-disable-line camelcase
    }

    async authenticate( scopes, message ) {
        let content;

        try {
            content = fs.readFileSync( this.TOKEN_PATH, 'utf8' );
        } catch ( err ) {
            return this.getAccessToken( this.oAuth2Client, scopes, message );
        }

        this.oAuth2Client.setCredentials( JSON.parse( content ) );
        return this.oAuth2Client;
    }

    async getAccessToken( oAuth2Client, scopes, message ) {
        const authUrl = oAuth2Client.generateAuthUrl( {
                access_type: 'offline', // eslint-disable-line camelcase
                scope: scopes
            } ),
            filter = ( m ) => m.author.id === message.author.id,
            response = await message.awaitReply( `Authorize this app by visiting this url: ${authUrl}`, filter, 60000 ),
            token = await oAuth2Client.getToken( response );

        await oAuth2Client.setCredentials( token );

        try {
            await fs.writeFileSync( this.TOKEN_PATH, JSON.stringify( token ) );
        } catch ( err ) {
            return console.error( 'Error retrieving access token', err );
        }

        console.log( 'Token stored to', this.TOKEN_PATH );
        return oAuth2Client;
    }
}

export default new GoogleClient();
