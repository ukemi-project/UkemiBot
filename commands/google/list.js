import GoogleDrive from '../../structures/GoogleDrive';
import Command from '../../structures/Command';

module.exports = class Google extends Command {
    constructor( ...args ) {
        super( ...args, {
            name: 'list',
            description: 'list drive files',
            category: 'Google',
            usage: 'list'
        } );
    }

    async run( message ) {
        GoogleDrive.listFiles( message );
    }
};
