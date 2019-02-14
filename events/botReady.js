import Event from '../structures/Event.js';
import ActivityUpdate from './../structures/ActivityUpdate';

module.exports = class extends Event {
    async run() {
        if ( this.client.users.has( '1' ) ) {
            this.client.users.delete( '1' );
        }

        setInterval( async() => {
            await ActivityUpdate.fetch( this.client );
        }, 20000 );

        console.log( `${this.client.user.tag}, ready to roll!` );
    }
};
