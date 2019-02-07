import Event from '../structures/Event.js';

module.exports = class extends Event {
    async run( guild ) {
        if ( !guild.available ) {
            return;
        }
        this.client.user.setActivity( `@${this.client.user.username} help` );
        console.log( `New guild has been joined: ${guild.name} (${guild.id}) with ${guild.memberCount - 1} members` );
    }
};
