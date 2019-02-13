import { google } from 'googleapis';
import fs from 'fs';
import request from 'request-promise';
import googleClient from '../structures/GoogleClient';

class GoogleDrive {
    constructor() {
        this.scopes = [ 'https://www.googleapis.com/auth/drive' ];
        this.rootFolder = '1JTapSPk1XNhxCKlJcOa53IW6QL6UjHa6';
        this.subFolder = {};
        this.drive = google.drive( {
            version: 'v3',
            auth: googleClient.oAuth2Client
        } );
    }

    async listFiles( message ) {
        let output = '= File List =\n\n',
            response;

        await googleClient.authenticate( this.scopes, message );

        try {
            response = await this.drive.files.list( {
                pageSize: 25,
                fields: 'nextPageToken, files(name)'
            } );
        } catch ( err ) {
            return console.log( `The API returned an error: ${err}` );
        }

        if ( !response.data.files.length ) {
            message.reply( 'No files found.' );
        }

        response.data.files.forEach( ( file ) => {
            output += `• ${file.name}\n`;
        } );

        message.channel.send( output, { code: 'asciidoc', split: { char: '\u200b' } } );
    }

    async uploadResource( message ) {
        /* TODO:
        *   Handle embed, and all attachment types.
        *   Work out a way to directly copy file instead of downloading and then uploading
        */

        const scopes = [ 'https://www.googleapis.com/auth/drive' ],
            drive = google.drive( {
                version: 'v3',
                auth: googleClient.oAuth2Client
            } );

        await googleClient.authenticate( scopes, message );
        await this.handleFolder( message );

        message.attachments.each( async( file ) => {
            await this.fileUploader( file, message );
        } );
    }

    async fileUploader( file, message ) {
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

        try {
            await drive.files.create( {
                requestBody: {},
                resource: fileMetadata,
                media: {
                    body: fs.createReadStream( `${file.name}` )
                },
                fields: 'id'
            } );
        } catch ( err ) {
            console.error( `Error uploading ${file.name}, ${err}` );
        }

        fs.unlink( `${file.name}`, ( err ) => {
            if ( err ) {
                console.log( `Error deleting ${file.name}, ${err}` );
            }
        } );

        message.react( '544264131780411437' );
        message.guild.channels
            .get( message.settings.botLogChannel )
            .send( ` uploaded ${file.name} from ${message.channel}.` );
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
