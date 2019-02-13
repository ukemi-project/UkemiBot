import Event from '../structures/Event.js';
import GoogleDrive from '../structures/GoogleDrive';
import GoogleSheets from '../structures/GoogleSheets';

module.exports = class extends Event {
    constructor( ...args ) {
        super( ...args );

        this.urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
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

        const prefix = new RegExp(
            `^<@!?${this.client.user.id}> |^${this.client.methods.util.regExpEsc( message.settings.prefix )}`
        ).exec( message.content );

        if ( prefix ) {
            const args = message.content
                    .slice( prefix[ 0 ].length )
                    .trim()
                    .split( / +/g ),
                cmd = this.client.commands.get( args.shift().toLowerCase() );

            if ( cmd ) {
                if ( cmd.guildOnly && !message.guild ) {
                    return message.channel.send( 'Please run this command in a guild.' );
                }

                const level = this.client.permlevel( message );

                message.author.permLevel = level;

                if ( level < this.client.levelCache[ cmd.permLevel ] ) {
                    return message.channel.send( 'Command level not met.' );
                }

                while ( args[ 0 ] && args[ 0 ][ 0 ] === '-' ) {
                    message.flags.push( args.shift().slice( 1 ) );
                }
                await this.runCommand( message, cmd, args );
            }
        }

        if ( !message.settings.resources.includes( message.channel.id ) ) {
            return;
        }

        if ( message.attachments.size ) {
            return GoogleDrive.uploadResource( message );
        }

        if ( this.urlRegex.exec( message.content ) !== null ) {
            const link = message.content.match( this.urlRegex ),
                description = message.cleanContent.replace( this.urlRegex, '' );

            if ( link.length > 1 ) {
                return message.reply( 'Please submit only one link at a time.' );
            }

            return GoogleSheets.resourceUpdate( link, description, message );
        }

        message.delete();

        message.guild.channels
            .get( message.settings.botLogChannel )
            .send( ` deleted ${message.author.username}'s message in ${message.channel}.` );

        message
            .reply(
                '\n\n**__Resources only!__**\n\n Take a minute to think if what you\'re sending is actually a useful resource. If it\'s something that can be shared as a link, uploaded to the drive, or forwarded in an email then do so. Unless the image is a visual resource itself it is not helpful. Screenshot spam polutes the resources channels so please avoid it.\n\nFormat for posting a resource should be:\n\n**Description:** <something describing the resource>\n**Resource:** <URL/IMG/ATTACHMENT>'
            )
            .then( ( msg ) => {
                setTimeout( () => {
                    msg.delete();
                }, 15000 );
            } );
    }

    async runCommand( message, cmd, args ) {
        try {
            await cmd.run( message, args );
        } catch ( err ) {
            console.log( err );
        }
    }
};
