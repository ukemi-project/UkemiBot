require( 'dotenv' ).config();
import UkemiBot from './structures/UkemiBot';

const errorDirnameRegex = new RegExp( `${__dirname}/`, 'g' ),
    client = new UkemiBot( {
        disabledEvents: [
            'CHANNEL_PINS_UPDATE',
            'GUILD_BAN_ADD',
            'GUILD_BAN_REMOVE',
            'RELATIONSHIP_ADD',
            'RELATIONSHIP_REMOVE',
            'TYPING_START',
            'VOICE_SERVER_UPDATE',
            'VOICE_STATE_UPDATE'
        ],
        disableEveryone: true,
        messageCacheMaxSize: 100,
        messageCacheLifetime: 240,
        messageSweepInterval: 300
    } );

client.login( process.env.TOKEN );

client
    .on( 'disconnect', () => console.log( 'Bot is disconnecting...' ) )
    .on( 'reconnecting', () => console.log( 'Bot reconnecting...' ) )
    .on( 'error', ( err ) => console.error( err ) )
    .on( 'warn', ( info ) => console.warn( info ) );

process.on( 'uncaughtException', ( err ) => {
    const errorMsg = err.stack.replace( errorDirnameRegex, './' );

    console.error( `Uncaught Exception: ${errorMsg}` );
    process.exit( 1 );
} );

process.on( 'unhandledRejection', console.error() );
