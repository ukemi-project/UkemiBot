export default class Config {
    constructor() {
        this.admins = [];
        this.support = [];
        this.resources = [ '543066349283442696', '543066467541975041' ];

        this.defaultSettings = {
            prefix: '.',
            modLogChannel: 'bot-log',
            announceChannel: 'announcements',
            patronRole: 'Patrons',
            modRole: 'Moderator',
            adminRole: 'Ukemi'
        };

        this.permLevels = [
            {
                level: 0,
                name: 'User',
                check: () => true
            },
            {
                level: 1,
                name: 'Patron',
                check: ( message ) => {
                    try {
                        const patronRole = message.guild.roles.find(
                            ( r ) => r.name.toLowerCase() === message.settings.patronRole.toLowerCase()
                        );

                        if ( patronRole && message.member.roles.has( patronRole.id ) ) {
                            return true;
                        }
                    } catch ( e ) {
                        return false;
                    }
                }
            },
            {
                level: 2,
                name: 'Moderator',
                check: ( message ) => {
                    try {
                        const modRole = message.guild.roles.find(
                            ( r ) => r.name.toLowerCase() === message.settings.modRole.toLowerCase()
                        );

                        if ( modRole && message.member.roles.has( modRole.id ) ) {
                            return true;
                        }
                    } catch ( e ) {
                        return false;
                    }
                }
            },
            {
                level: 3,
                name: 'Administrator',
                check: ( message ) => {
                    try {
                        const adminRole = message.guild.roles.find(
                            ( r ) => r.name.toLowerCase() === message.settings.adminRole.toLowerCase()
                        );

                        return adminRole && message.member.roles.has( adminRole.id );
                    } catch ( e ) {
                        return false;
                    }
                }
            },
            {
                level: 4,
                name: 'Server Owner',
                check: ( message ) =>
                    ( message.channel.type === 'text' ? message.guild.owner.user.id === message.author.id : false )
            },
            {
                level: 8,
                name: 'Bot Support',
                check: ( message ) => config.support.includes( message.author.id )
            },
            {
                level: 9,
                name: 'Bot Admin',
                check: ( message ) => config.admins.includes( message.author.id )
            },
            {
                level: 10,
                name: 'Bot Owner',
                check: ( message ) => message.client.appInfo.owner.id === message.author.id
            }
        ];
    }
}
