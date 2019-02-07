import Event from '../structures/Event.js';
import { link } from 'fs';

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

        if ( message.settings.resources.includes( message.channel.id ) ) {
            if ( !message.attachments.size && !message.embeds.length ) {
                message.delete();

                message.guild.channels
                    .get( message.settings.botLogChannel )
                    .send( `Message from ${message.author.username} has been deleted in ${message.channel}` );

                message
                    .reply(
                        '\n\n**__Resources only!__**\n\n Take a minute to think if what you\'re trying to send is actually a useful resource. If it\'s something that can be shared as a link, uploaded to the drive, or forwarded in an email then do so. Unless the image is a visual resource itself it is not helpful. Screenshot spam polutes the resources channels so please avoid it.\n\nFormat for posting a resource should be:\n\n**Description:** <something describing the resource>\n**Resource:** <URL/IMG/ATTACHMENT>'
                    )
                    .then( ( msg ) => {
                        setTimeout( () => {
                            msg.delete();
                        }, 20000 );
                    } );
            }
        }
    }
};
