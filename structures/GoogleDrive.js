import { google } from 'googleapis';
import fs from 'fs';
import request from 'request-promise';
import googleClient from '../structures/GoogleClient';

class GoogleDrive {
    constructor() {
        this.scopes = [ 'https://www.googleapis.com/auth/drive' ];
        this.rootFolder = '1JTapSPk1XNhxCKlJcOa53IW6QL6UjHa6';
        this.subFolder = '';
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
        await googleClient.authenticate( this.scopes, message );

        await this.handleFolder( message );

        message.attachments.each( ( file ) => {
            this.fileUploader( file, message );
        } );
    }

    async handleFolder( message ) {
        let response;

        try {
            response = await this.drive.files.list( {
                q: `mimeType='application/vnd.google-apps.folder' and name='${message.channel.parent.name}'`,
                fields: 'files(id, name)'
            } );
        } catch ( err ) {
            return console.log( err );
        }

        if ( response.data.files.length ) {
            this.subFolder = response.data.files[ 0 ].id;
            return this.subFolder;
        }

        try {
            response = await this.drive.files.create( {
                resource: {
                    name: message.channel.parent.name,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [ this.rootFolder ]
                },
                fields: 'id'
            } );
        } catch ( e ) {
            return console.error( e );
        }

        this.subFolder = response.data.id;
        return this.subFolder;
    }

    async fileUploader( file, message ) {
        const fileStream = fs.createWriteStream( `${file.name}` ),
            fileMetadata = {
                name: `${file.name}`,
                parents: [ this.subFolder ],
                description: message.cleanContent
            };
        let media = {};

        await request
            .get( file.attachment )
            .on( 'response', ( response ) => {
                response.pipe( fileStream );
                media.mimeType = response.headers[ 'content-type' ];
            } )
            .on( 'error', ( err ) => {
                return console.log( err );
            } );

        try {
            await this.drive.files.create( {
                requestBody: fileMetadata,
                media: {
                    body: fs.createReadStream( `${file.name}` )
                }
            } );
        } catch ( err ) {
            return console.error( `Error uploading ${file.name}, ${err}` );
        }

        fs.unlink( `${file.name}`, ( err ) => {
            if ( err ) {
                return console.log( `Error deleting ${file.name}, ${err}` );
            }
        } );

        message.react( '544264131780411437' );
        message.guild.channels
            .get( message.settings.botLogChannel )
            .send( ` uploaded ${file.name} from: ${message.channel.parent.name}**/**${message.channel}.` );
        return;
    }
}

export default new GoogleDrive();
