"use strict";

module.exports = (bottle) =>
    bottle.service('Manager', function (Game) {
        class Manager {
            constructor (reg) {
                this.reg = reg
            }

            /**
             * create the initial game to be played; also registers it with the registry
             *
             * @param channel {string} required
             * @param userA {string} optional; @TODO: filter for legal names
             * @param userB {string} optional; @TODO: filter for legal names
             * @returns {Game|null}
             */
            createGame (channel, userA, userB) {
                if (!channel) {
                    throw new Error('channel required');
                }
                if (this.reg.has(channel)) {
                    throw new Error('game in play');
                }
                let game = new Game(channel, userA, userB);
                this.reg.set(game.channel, game);
                return game;
            }

            endGame(game) {
                if (game && game.hasOwnProperty('channel')) game = game.channel;
                if (game) {
                    if(this.reg.has(game)){
                        this.reg.delete(game);
                    }
                }
            }

            set reg (val) {
                this._reg = val;
            }

            get reg () {
                return this._reg;
            }
        }

        return Manager;
    }, 'Game');
