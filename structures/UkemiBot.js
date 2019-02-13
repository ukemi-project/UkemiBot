import { Client } from 'discord.js';
import CommandStore from './CommandStore';
import EventStore from './EventStore';
import Enmap from 'enmap';
import EnmapLevel from 'enmap-level';
import Config from './Config';

class UkemiBot extends Client {
    constructor( options ) {
        super( options );

        this.config = new Config();

        this.commands = new CommandStore( this );
        this.events = new EventStore( this );

        this.levelCache = {};
        this.methods = {
            util: require( '../util/util.js' )
        };

        // Enmap
        this.settings = new Enmap( { provider: new EnmapLevel( { name: 'settings' } ) } );

        this.ready = false;
        this.on( 'ready', this._ready.bind( this ) );
    }

    async login( token ) {
        await this.init();
        return super.login( token );
    }

    _ready() {
        this.ready = true;
        this.emit( 'botReady' );
    }

    get ping() {
        return this.pings.reduce( ( prev, p ) => prev + p, 0 ) / this.pings.length;
    }

    get status() {
        return this.ws.connection ? this.ws.connection.status : null;
    }

    permlevel( message ) {
        let permlvl = 0;

        const permOrder = this.config.permLevels.slice( 0 ).sort( ( prev, val ) => ( prev.level < val.level ? 1 : -1 ) );

        while ( permOrder.length ) {
            const currentLevel = permOrder.shift();

            if ( currentLevel.check( message ) ) {
                permlvl = currentLevel.level;
                break;
            }
        }
        return permlvl;
    }

    getGuildSettings( guild ) {
        const def = this.config.defaultSettings;

        if ( !guild ) {
            return def;
        }

        const returns = {},
            overrides = this.settings.get( guild.id ) || {};

        for ( const key in def ) {
            returns[ key ] = overrides[ key ] || def[ key ];
        }

        return returns;
    }

    getSettings( id ) {
        const defaults = this.settings.get( 'default' ) || this.config.defaultSettings;
        let guild = this.settings.get( id );

        if ( typeof guild !== 'object' ) {
            guild = {};
        }
        const returnObject = {};

        Object.keys( defaults ).forEach( ( key ) => {
            returnObject[ key ] = guild[ key ] ? guild[ key ] : defaults[ key ];
        } );

        return returnObject;
    }

    writeSettings( id, newSettings ) {
        const defaults = this.settings.get( 'default' ) || this.config.defaultSettings;
        let settings = this.settings.get( id );

        if ( typeof settings !== 'object' ) {
            settings = {};
        }

        for ( const key in newSettings ) {
            if ( defaults[ key ] !== newSettings[ key ] ) {
                settings[ key ] = newSettings[ key ];
            } else {
                delete settings[ key ];
            }
        }

        this.settings.set( id, settings );
    }

    async init() {
        const [ commands, events ] = await Promise.all( [ this.commands.loadFiles(), this.events.loadFiles() ] );

        console.log( `Loaded a total of ${commands} commands` );
        console.log( `Loaded a total of ${events} events` );

        for ( let i = 0; i < this.config.permLevels.length; i++ ) {
            const thisLevel = this.config.permLevels[ i ];

            this.levelCache[ thisLevel.name ] = thisLevel.level;
        }
    }
}

export default UkemiBot;
