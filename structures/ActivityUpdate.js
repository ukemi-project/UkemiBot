import request from 'request-promise';

class ActivityUpdate {
    constructor() {
        this.presence = {
            status: 'online',
            afk: 0,
            activity: {
                name: 'feedback.',
                type: 'LISTENING'
            }
        };
        // prettier-ignore
        this.url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=LodestoneMusic&api_key=${process.env.LASTFM}&format=json&limit=1`;
    }

    async fetch( client ) {
        let lastResponse, currentTrack;

        try {
            lastResponse = JSON.parse( await request.get( this.url ) ).recenttracks.track[ 0 ];
        } catch ( e ) {
            return console.error( e );
        }

        currentTrack = `${lastResponse.artist[ '#text' ]} - ${lastResponse.name}`;

        if ( !lastResponse[ '@attr' ] ) {
            this.presence.activity.name = 'nothing';
            return this.update( client );
        }

        if ( !lastResponse[ '@attr' ].nowplaying ) {
            return;
        }

        if ( this.presence.activity.name === currentTrack ) {
            return;
        }

        this.presence.activity.name = currentTrack;
        return this.update( client );
    }

    update( client ) {
        client.user.setPresence( this.presence );
        return console.log( `Activity changed to: ${this.presence.activity.name}` );
    }
}

export default new ActivityUpdate();
