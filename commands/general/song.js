import Command from '../../structures/Command';
import Youtube from '../../structures/Youtube';
import ActivityUpdate from '../../structures/ActivityUpdate';

module.exports = class Google extends Command {
    constructor( ...args ) {
        super( ...args, {
            name: 'song',
            description: 'Display the current song and attempt to get youtube link.',
            category: 'General'
        } );
    }

    async run( message ) {
        if ( ActivityUpdate.presence.activity.name === 'feedback' ) {
            return message.channel.send( 'Not currently listening to anything!' );
        }

        const song = await Youtube.search( ActivityUpdate.presence.activity.name, message );

        message.channel.send(
            `Currently listening to: **${ActivityUpdate.presence.activity
                .name}**\n\nhttps://www.youtube.com/watch?v=${song}`
        );
    }
};
