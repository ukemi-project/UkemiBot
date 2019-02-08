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
        await this.runDrive( args[ 0 ] );
    }
};
