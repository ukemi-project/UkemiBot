import { google } from 'googleapis';
import fs from 'fs';
import request from 'request-promise';
import googleClient from '../structures/GoogleClient';

class GoogleDrive {
    constructor() {
        this.rootFolder = '1JTapSPk1XNhxCKlJcOa53IW6QL6UjHa6';
        this.subFolder = {};
    }

    listFiles( message ) {
        const scopes = [ 'https://www.googleapis.com/auth/drive.metadata.readonly' ],
            drive = google.drive( {
                version: 'v3',
                auth: googleClient.oAuth2Client
            } );

        googleClient
            .authenticate( scopes, message )
            .then( () => {
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
            } )
            .catch( console.error );
    }

    uploadResource( message ) {
        /* TODO: Remove local file
        *   Handle embed, and all attachment types.
        *   Local files to go into a folder.
        *   Work out a way to directly copy file instead of downloading and then uploading
        */

        const scopes = [ 'https://www.googleapis.com/auth/drive' ],
            drive = google.drive( {
                version: 'v3',
                auth: googleClient.oAuth2Client
            } );

        googleClient
            .authenticate( scopes, message )
            .then( () => {
                message.attachments.each( async( file ) => {
                    await this.handleFolder( message );

                    const fileStream = fs.createWriteStream( `${file.name}` ),
                        fileMetadata = {
                            name: `${file.name}`,
                            parents: [ this.subFolder ]
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
            } )
            .catch( console.error );
    }

    handleFolder( message ) {
        const scopes = [ 'https://www.googleapis.com/auth/drive' ],
            drive = google.drive( {
                version: 'v3',
                auth: googleClient.oAuth2Client
            } );

        return new Promise( ( resolve, reject ) => {
            googleClient
                .authenticate( scopes, message )
                .then( () => {
                    drive.files.list(
                        {
                            q: `mimeType='application/vnd.google-apps.folder' and name='${message.channel.parent
                                .name}'`,
                            fields: 'files(id, name)'
                        },
                        ( err, file ) => {
                            if ( err ) {
                                drive.files.create(
                                    {
                                        resource: {
                                            name: message.channel.parent.name,
                                            mimeType: 'application/vnd.google-apps.folder',
                                            parents: [ this.rootFolder ]
                                        },
                                        fields: 'id'
                                    },
                                    ( error, folder ) => {
                                        if ( error ) {
                                            reject( error );
                                        } else {
                                            this.subFolder = folder.data.id;
                                            resolve( this.subFolder );
                                        }
                                    }
                                );
                            } else {
                                this.subFolder = file.data.files[ 0 ].id;
                                resolve( this.subFolder );
                            }
                        }
                    );
                } )
                .catch( console.error );
        } );
    }
}

export default new GoogleDrive();
