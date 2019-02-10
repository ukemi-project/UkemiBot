import { google } from 'googleapis';
import fs from 'fs';
import readline from 'readline';

class GoogleDrive {
    constructor() {
        // super(client, file, Object.assign(options, { guildOnly: true }));

        this.SCOPES = [ 'https://www.googleapis.com/auth/drive.metadata.readonly' ];
        this.TOKEN_PATH = 'token.json';
    }

    runDrive( method ) {
        const command = method || 'listFiles';

        this.authorize( this[ command ] );
    }

    authorize( callback ) {
        fs.readFile( 'credentials.json', ( err, content ) => {
            if ( err ) {
                return console.log( 'Error loading client secret file:', err );
            }
            // eslint-disable-next-line camelcase
            const { client_secret, client_id, redirect_uris } = JSON.parse( content ).installed,
                oAuth2Client = new google.auth.OAuth2( client_id, client_secret, redirect_uris[ 0 ] ); // eslint-disable-line camelcase

            fs.readFile( this.TOKEN_PATH, ( err, token ) => {
                if ( err ) {
                    return this.getAccessToken( oAuth2Client, callback );
                }
                oAuth2Client.setCredentials( JSON.parse( token ) );
                callback( oAuth2Client );
            } );
        } );
    }

    /**
       * Get and store new token after prompting for user authorization, and then
       * execute the given callback with the authorized OAuth2 client.
       * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
       * @param {getEventsCallback} callback The callback for the authorized client.
       */
    getAccessToken( oAuth2Client, callback ) {
        const authUrl = oAuth2Client.generateAuthUrl( {
                access_type: 'offline', // eslint-disable-line camelcase
                scope: this.SCOPES
            } ),
            rl = readline.createInterface( {
                input: process.stdin,
                output: process.stdout
            } );

        console.log( 'Authorize this app by visiting this url:', authUrl );

        rl.question( 'Enter the code from that page here: ', ( code ) => {
            rl.close();
            oAuth2Client.getToken( code, ( err, token ) => {
                if ( err ) {
                    return console.error( 'Error retrieving access token', err );
                }
                oAuth2Client.setCredentials( token );
                // Store the token to disk for later program executions
                fs.writeFile( this.TOKEN_PATH, JSON.stringify( token ), ( err ) => {
                    if ( err ) {
                        console.error( err );
                    }
                    console.log( 'Token stored to', this.TOKEN_PATH );
                } );
                callback( oAuth2Client );
            } );
        } );
    }

    /**
       * Lists the names and IDs of up to 10 files.
       * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
       */
    listFiles( auth ) {
        const drive = google.drive( { version: 'v3', auth } );

        drive.files.list(
            {
                pageSize: 10,
                fields: 'nextPageToken, files(id, name)'
            },
            ( err, res ) => {
                if ( err ) {
                    return console.log( `The API returned an error: ${err}` );
                }
                const files = res.data.files;

                if ( files.length ) {
                    console.log( 'Files:' );
                    files.map( ( file ) => {
                        console.log( `${file.name} (${file.id})` );
                    } );
                } else {
                    console.log( 'No files found.' );
                }
            }
        );
    }
}

export default new GoogleDrive();
