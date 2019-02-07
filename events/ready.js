import Event from '../structures/Event.js';

module.exports = class extends Event {
    async run() {
        if ( this.client.users.has( '1' ) ) {
            this.client.users.delete( '1' );
        }

        this.client.user.setActivity(
            `@${this.client.user.username} help | ${this.client.guilds.size.toLocaleString()} Server${this.client.guilds
                .size > 1				? 's'				: ''}`
        );

        console.log(
            `${this.client.user.tag}, ready to serve ${this.client.users.size} users in ${this.client.guilds
                .size} servers.`
        );
    }
};
