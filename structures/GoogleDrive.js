import { google } from 'googleapis';
import fs from 'fs';
import readline from 'readline';
import request from 'request-promise';

//  TODO: refactor out auth from action methods
class GoogleDrive {
    constructor() {
        this.SCOPES = [ 'https://www.googleapis.com/auth/drive' ];
        this.TOKEN_PATH = 'token.json';
    }

    runDrive( method, message ) {
        const command = method || 'listFiles';
        // TODO: Check input method

        this.authorize( this[ command ], message );
    }

    authorize( callback, message ) {
        fs.readFile( 'credentials.json', ( err, content ) => {
            if ( err ) {
                return console.log( 'Error loading client secret file:', err );
            }
            // eslint-disable-next-line camelcase
            const { client_secret, client_id, redirect_uris } = JSON.parse( content ).installed,
                oAuth2Client = new google.auth.OAuth2( client_id, client_secret, redirect_uris[ 0 ] ); // eslint-disable-line camelcase

            fs.readFile( this.TOKEN_PATH, ( err, token ) => {
                if ( err ) {
                    return this.getAccessToken( oAuth2Client, callback, message );
                }
                oAuth2Client.setCredentials( JSON.parse( token ) );
                callback( oAuth2Client, message );
            } );
        } );
    }

    getAccessToken( oAuth2Client, callback, message ) {
        const authUrl = oAuth2Client.generateAuthUrl( {
                access_type: 'offline', // eslint-disable-line camelcase
                scope: this.SCOPES
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
                fs.writeFile( this.TOKEN_PATH, JSON.stringify( token ), ( err ) => {
                    if ( err ) {
                        console.error( err );
                    }
                    console.log( 'Token stored to', this.TOKEN_PATH );
                } );
                callback( oAuth2Client, message );
            } );
        } );
    }

    listFiles( auth, message ) {
        const drive = google.drive( { version: 'v3', auth } );
        let output = '= File List =\n\n';

        drive.files.list(
            {
                pageSize: 50,
                fields: 'nextPageToken, files(name)'
            },
            ( err, res ) => {
                if ( err ) {
                    return console.log( `The API returned an error: ${err}` );
                }

                const files = res.data.files;

                if ( files.length ) {
                    files.forEach( ( file ) => {
                        output += `• ${file.name}\n`;
                    } );
                } else {
                    message.reply( 'No files found.' );
                }
                message.channel.send( output, { code: 'asciidoc', split: { char: '\u200b' } } );
            }
        );
    }

    uploadResource( auth, message ) {
        /* TODO: Remove local file
        *   Handle embed, and all attachment types.
        *   Local files to go into a folder.
        *   Upload to directory based on channel
        *   Work out a way to directly copy file instead of downloading and then uploading
        */

        const drive = google.drive( { version: 'v3', auth } ),
            rootFolder = '1JTapSPk1XNhxCKlJcOa53IW6QL6UjHa6',
            subFolder = this.handleFolder( auth, message );

        message.attachments.each( async( file ) => {
            const fileStream = fs.createWriteStream( `${file.name}` ),
                fileMetadata = {
                    name: `${file.name}`,
                    parents: [ rootFolder, subFolder ]
                };
            let media = {};

            await request
                .get( file.attachment )
                .on( 'response', ( response ) => {
                    response.pipe( fileStream );

                    media.mimeType = response.headers[ 'content-type' ];
                } )
                .on( 'error', ( err ) => {
                    console.log( err );
                } );

            await drive.files.create(
                {
                    requestBody: {},
                    resource: fileMetadata,
                    media: {
                        body: fs.createReadStream( `${file.name}` )
                    },
                    fields: 'id'
                },
                ( err ) => {
                    if ( err ) {
                        console.error( err );
                    } else {
                        message.react( '544264131780411437' );
                        message.guild.channels
                            .get( message.settings.botLogChannel )
                            .send( ` uploaded ${file.name} from ${message.channel}.` );
                    }
                }
            );
        } );
    }

    handleFolder( auth, message ) {
        const drive = google.drive( { version: 'v3', auth } );

        drive.files.list(
            {
                q: `mimeType = 'application/vnd.google-apps.folder' and name = ${message.channel.parent.name}`,
                fields: 'files(id, name)'
            },
            ( err, file ) => {
                if ( err ) {
                    drive.files.create(
                        {
                            resource: {
                                name: message.channel.parent.name,
                                mimeType: 'application/vnd.google-apps.folder'
                            },
                            fields: 'id'
                        },
                        ( error, folder ) => {
                            if ( error ) {
                                console.error( error );
                            } else {
                                return folder.id;
                            }
                        }
                    );
                } else {
                    return file.id;
                }
            }
        );
    }
}

export default new GoogleDrive();
