import { Structures } from 'discord.js';

module.exports = Structures.extend(
    'Message',
    ( Message ) =>
        class extends Message {
            constructor( ...args ) {
                super( ...args );

                this.settings = this.client.getGuildSettings( this.guild );
                this.flags = [];
            }

            get member() {
                if ( this.guild ) {
                    return super.member;
                }
                return {
                    user: this.channel.recipient,
                    displayName: this.channel.recipient.username
                };
            }
        }
);
