import Event from '../structures/Event.js';

module.exports = class extends Event {
    constructor( ...args ) {
        super( ...args );
    }

    async run( message ) {
        if ( message.author.bot ) {
            return;
        }

        if ( message.guild && !message.guild.me ) {
            await message.guild.members.fetch( this.client.user );
        }
        if ( message.guild && !message.channel.id ) {
            return;
        }
    }
};
