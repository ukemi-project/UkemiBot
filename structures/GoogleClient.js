import { google } from 'googleapis';
import fs from 'fs';
import readline from 'readline';

class GoogleClient {
    constructor( options ) {
        this._options = options || { scopes: [] };
        this.TOKEN_PATH = 'token.json';
        this.KEY_PATH = 'credentials.json';

        fs.readFile( this.KEY_PATH, ( err, content ) => {
            if ( err ) {
                return console.log( 'Error loading client secret file:', err );
            }
            // eslint-disable-next-line camelcase
            const { client_secret, client_id, redirect_uris } = JSON.parse( content ).installed;

            this.oAuth2Client = new google.auth.OAuth2( client_id, client_secret, redirect_uris[ 0 ] ); // eslint-disable-line camelcase
        } );
    }

    authenticate( scopes, message ) {
        return new Promise( ( resolve, reject ) => {
            fs.readFile( this.TOKEN_PATH, ( error, token ) => {
                if ( error ) {
                    return this.getAccessToken( this.oAuth2Client, scopes, message );
                }
                this.oAuth2Client.setCredentials( JSON.parse( token ) );
                resolve( this.oAuth2Client );
            } );
        } );
    }

    getAccessToken( oAuth2Client, scopes, message ) {
        const authUrl = oAuth2Client.generateAuthUrl( {
                access_type: 'offline', // eslint-disable-line camelcase
                scope: scopes
            } ),
            rl = readline.createInterface( {
                input: process.stdin,
                output: process.stdout
            } );

        message.reply( `Authorize this app by visiting this url: ${authUrl}` );

        rl.question( 'Enter the code from that page here: ', ( code ) => {
            rl.close();
            oAuth2Client.getToken( code, ( err, token ) => {
                if ( err ) {
                    return console.error( 'Error retrieving access token', err );
                }
                oAuth2Client.setCredentials( token );
                // Store the token to disk for later program executions
                fs.writeFile( this.TOKEN_PATH, JSON.stringify( token ), ( error ) => {
                    if ( error ) {
                        console.error( error );
                    }
                    console.log( 'Token stored to', this.TOKEN_PATH );
                } );
                return oAuth2Client;
            } );
        } );
    }
}

export default new GoogleClient();
