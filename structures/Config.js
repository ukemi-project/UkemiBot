export default class Config {
    constructor() {
        this.owner = '113226391771717632';

        this.defaultSettings = {
            prefix: '.',
            botLogChannel: '543064645292785665',
            modRole: 'Moderator',
            adminRole: 'Ukemi',
            resources: [ '543066349283442696', '543066467541975041' ]
        };

        this.permLevels = [
            {
                level: 0,
                name: 'User',
                check: () => true
            },
            {
                level: 1,
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
                level: 2,
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
                level: 3,
                name: 'Bot Owner',
                check: ( message ) => this.owner === message.author.id
            }
        ];
    }
}
