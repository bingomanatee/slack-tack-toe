"use strict";
var events = require('events');
var _ = require('lodash');

/**
 * This is a TickTackToe game in progress.
 * the data is a flat array (r1c1, r1c2, r1c3, r2c1... r3ce3);
 * row and column are zero indexed.
 * Players are 1-indexed -- player 1 or player 2.
 * the board is an array containing 0 (unplayed), 1 (player 1) or 2 (player 2).
 */

const goodIndex = (i) => {
    let out = false;
    switch (i) {
        case 0 :
            out = true;
            break;

        case 1:
            out = true;
            break;

        case 2:
            out = true;
            break;

        default:
            out = false;
    }
    return out;
};


const goodWhoseTurn = (i) => {
    let out = false;
    switch (i) {
        case 1:
            out = true;
            break;

        case 2:
            out = true;
            break;

        default:
            out = false;
    }
    return out;
};

class Game extends events.EventEmitter {
    constructor (channel, user1, user2) {
        super();
        this.channel = channel;
        this.user1 = user1;
        this.user2 = user2;
        this.board = _.range(0, 9).map(() => 0);
        this.whoseTurn = 1;
        this.turn = 0;
    }

    move (row, column) {
        if (!(goodIndex(row) && goodIndex(column))) {
            throw new Error(`bad row/column ${row}/${column}`);
        }
        var index = (row * 3) + column;
        if (this.board[index]) {
            throw new Error(`attempt to replay row/column ${row}/${column} by player ${this.whoseTurn}`);
        }
        this.board[index] = this.whoseTurn;
        this.next();
    }

    /**
     * @param val {Number}
     */
    set turn (val) {
        if (isNaN(val) || val < 0) {
            throw new Error(`bad turn ${val}`);
        }
        this._turn = val;
    }

    get turn () {
        return this._turn;
    }

    /**
     * @param val {Number} 1 or 2
     */
    set whoseTurn (val) {
        if (!goodWhoseTurn(val)) {
            throw new Error(`bad value for whoseTurn ${val}`);
        }
        this._whoseTurn = val;
    }

    get whoseTurn () {
        return this._whoseTurn;
    }

    next () {
        this.whoseTurn = this.whoseTurn === 1 ? 2 : 1;
        this.turn = this.turn + 1;
    }

    set channel (val) {
        this._channel = val;
    }

    get channel () {
        return this._channel;
    }

    set player1 (val) {
        this._player1 = val;
    }

    get player1 () {
        return this._player1;
    }

    set player2 (val) {
        this._player2 = val;
    }

    get player2 () {
        return this._player2;
    }
}

module.exports = (bottle) => {
    bottle.service('Game', function () {
        return Game;
    });
};
