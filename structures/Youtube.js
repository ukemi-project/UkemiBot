import { google } from 'googleapis';
import googleClient from './GoogleClient';

class Youtube {
    constructor() {
        this.scopes = [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/youtube'
        ];
        this.youtube = google.youtube( {
            version: 'v3',
            auth: googleClient.oAuth2Client
        } );
    }

    async search( searchString, message ) {
        let res;

        await googleClient.authenticate( this.scopes, message );

        try {
            res = await this.youtube.search.list( {
                part: 'snippet',
                q: searchString,
                maxResults: 1,
                type: 'video'
            } );
        } catch ( err ) {
            return err;
        }

        return res.data.items[ 0 ].id.videoId;
    }
}

export default new Youtube();
