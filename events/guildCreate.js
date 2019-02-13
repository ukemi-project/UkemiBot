import Event from '../structures/Event.js';

module.exports = class extends Event {
    async run( guild ) {
        if ( !guild.available ) {
            return;
        }

        console.log( `New guild has been joined: ${guild.name}` );
    }
};
