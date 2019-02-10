import GoogleDrive from '../../structures/GoogleDrive';
import Command from '../../structures/Command';

module.exports = class Google extends Command {
    constructor( ...args ) {
        super( ...args, {
            name: 'google',
            description: '...',
            category: 'Api',
            usage: 'google'
        } );
    }

    async run( message, args, level ) {
        await GoogleDrive.runDrive( args[ 0 ] );
    }
};
