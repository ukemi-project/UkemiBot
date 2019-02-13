import GoogleDrive from '../../structures/GoogleDrive';
import Command from '../../structures/Command';

module.exports = class Google extends Command {
    constructor( ...args ) {
        super( ...args, {
            name: 'list',
            description: 'list drive files',
            category: 'Google',
            permLevel: 'Moderator'
        } );
    }

    async run( message ) {
        GoogleDrive.listFiles( message );
    }
};
