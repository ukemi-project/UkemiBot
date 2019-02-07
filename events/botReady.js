import Event from '../structures/Event.js';

module.exports = class extends Event {
    async run() {
        if ( this.client.users.has( '1' ) ) {
            this.client.users.delete( '1' );
        }

        console.log( `${this.client.user.tag}, ready to roll!` );
    }
};
