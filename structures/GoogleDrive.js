import { google } from 'googleapis';
import Command from './Command';
import fs from 'fs';
import readline from 'readline';

class GoogleDrive extends Command {
    constructor( client, file, options = {} ) {
        super( client, file, Object.assign( options, { guildOnly: true } ) );

        this.SCOPES = [ 'https://www.googleapis.com/auth/drive.metadata.readonly' ];
        this.TOKEN_PATH = 'token.json';
    }

    token( method ) {
        // Load client secrets from a local file.
        fs.readFile( 'credentials.json', ( err, content ) => {
            if ( err ) {
                return console.log( 'Error loading client secret file:', err );
            }
            // Authorize a client with credentials, then call the Google Drive API.
            this.authorize( JSON.parse( content ), this[ method ] );
        } );
    }

    authorize( credentials, callback ) {
        const { client_secret, client_id, redirect_uris } = credentials.installed,
            oAuth2Client = new google.auth.OAuth2( client_id, client_secret, redirect_uris[ 0 ] );

        // Check if we have previously stored a token.
        fs.readFile( this.TOKEN_PATH, ( err, token ) => {
            if ( err ) {
                return this.getAccessToken( oAuth2Client, callback );
            }
            oAuth2Client.setCredentials( JSON.parse( token ) );
            callback( oAuth2Client );
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
            access_type: 'offline',
            scope: this.SCOPES
        } );

        console.log( 'Authorize this app by visiting this url:', authUrl );
        const rl = readline.createInterface( {
            input: process.stdin,
            output: process.stdout
        } );

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

export default GoogleDrive;
