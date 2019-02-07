import GoogleDrive from '../../structures/GoogleDrive';

module.exports = class Google extends GoogleDrive {
    constructor( ...args ) {
        super( ...args, {
            name: 'google',
            description: '...',
            category: 'Api',
            usage: 'google'
        } );
    }

    async run( message, args, level ) {
        if ( args.length === 0 ) {
            return message.reply( 'You need to supply a command to run!' );
        }

        await this.runDrive( args[ 0 ] );
    }
};
