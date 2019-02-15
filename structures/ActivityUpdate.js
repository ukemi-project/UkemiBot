import request from 'request-promise';

class ActivityUpdate {
    constructor() {
        this.presence = {
            status: 'online',
            afk: 0,
            activity: {
                name: 'feedback',
                type: 'LISTENING'
            }
        };
        // prettier-ignore
        this.url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=LodestoneMusic&api_key=${process.env.LASTFM}&format=json&limit=1`;
    }

    async fetch( client ) {
        let lastResponse;

        try {
            lastResponse = JSON.parse( await request.get( this.url ) ).recenttracks.track[ 0 ];
        } catch ( e ) {
            return this.update( client, 'feedback' );
        }

        if ( !lastResponse[ '@attr' ] ) {
            return this.update( client, 'feedback' );
        }

        if ( !lastResponse[ '@attr' ].nowplaying ) {
            return;
        }

        const currentTrack = `${lastResponse.artist[ '#text' ]} - ${lastResponse.name}`;

        if ( this.presence.activity.name === currentTrack ) {
            return;
        }

        return this.update( client, currentTrack );
    }

    update( client, track ) {
        this.presence.activity.name = track;

        client.user.setPresence( this.presence );
        return console.log( `Activity changed to: ${this.presence.activity.name}` );
    }
}

export default new ActivityUpdate();
