"use strict";
var events = require('events');
var _ = require('lodash');

/**
 * This is a TickTackToe game in progress.
 * the data is a flat array (r1c1, r1c2, r1c3, r2c1... r3ce3);
 * row and col are zero indexed.
 * Players are 1-indexed -- player 1 or player 2.
 * the board is an array containing 0 (unplayed), 1 (player 1) or 2 (player 2).
 *
 * Errors
 *
 * Everything except a legal move throws an error:
 *
 *  - attempting to play in an already played position
 *  - attempting to move after a game has been won
 *  - attempting to play out of the coordinate system of the board([0..2], [0..2])
 *
 */

// @TODO: bottle up these submethods

function goodIndex (i) {
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
}

function goodPlayer (i) {
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
}

function goodPlayerOrNobody (i) {
    return i === 0 ? true : goodPlayer(i);
}

const VECTORS = [
    [
        0, 0, 1, 0
    ],
    [
        0, 1, 1, 0
    ],
    [
        0, 2, 1, 0
    ],
    [
        0, 0, 0, 1
    ],
    [
        1, 0, 0, 1
    ],
    [
        2, 0, 0, 1
    ],
    [
        0, 0, 1, 1
    ],
    [
        2, 0, -1, 1
    ]
];

const slot = (r, c, l) => ({
    row: r,
    col: c,
    letter: l
});

const SLOTS = [
    slot(0, 0, 'a'),
    slot(0, 1, 'b'),
    slot(0, 2, 'c'),
    slot(1, 0, 'd'),
    slot(1, 1, 'e'),
    slot(1, 2, 'f'),
    slot(2, 0, 'g'),
    slot(2, 1, 'h'),
    slot(2, 2, 'i')
];

function samePlayer (played, r, c, val) {
    let out = true;
    if (!val) {
        out = false;
    } else if (played.length) {
        out = val === played[0];// all values are the same.
    }
    return out;
}

class Game extends events.EventEmitter {
    /**
     *
     * Note the norm is fir user1 to be present (they issued the create game command)
     * and user2 is NOT set (they opt in by typing '/ttt-join' after a game is created).
     *
     * @param channel {String}
     * @param user1 {String} (Optional)
     * @param user2 {String} (Optional)
     */
    constructor (channel, user1, user2) {
        super();
        this.channel = channel;
        this.user1 = user1;
        this.user2 = user2;
        this.board = _.range(0, 9).map(() => 0);
        this.whoseTurn = 1;
        this.turn = 0;
        this.whoWon = 0;
    }

    /**
     * this method gets all the values in a series.
     * for expediency/matching purposes the loop is ended
     * if test is present and returns invalid.
     *
     * @param startRow {Number}
     * @param startCol {Number}
     * @param addRow {Number}
     * @param addCol {Number}
     * @param test {Function?} with signature(currentValues, row, col, nextValue(at row, col));
     * @returns {Array}
     */
    getVector (startRow, startCol, addRow, addCol, test) {
        let out = [];
        let row = startRow;
        let col = startCol;
        while (goodIndex(row) && goodIndex(col)) {
            let val = this.getCell(row, col);
            if (test && !test(out, row, col, val)) {
                break;
            }
            out.push(val);
            row += addRow;
            col += addCol;
        }
        return out;
    }

    toJSON () {
        const out = _.pick(this, 'channel,user1,user2'.split(','));
        out.board = this.board.slice(0);
        return out;
    }

    getCell (row, col) {
        return this.board[this._index(row, col)];
    }

    setCell (row, col, player) {
        if (!goodPlayer(player)) {
            throw new Error(`attempt to set cell with wrong player ${player}`);
        }
        const index = this._index(row, col);
        this._board[index] = player;
    }

    _index (row, col) {
        if (!(goodIndex(row) && goodIndex(col))) {
            throw new Error(`bad row/col ${row}/${col}`);
        }
        return (row * 3) + col;
    }

    move (row, col) {
        if (this.whoWon) {
            throw new Error('cannot move after a winning play');
        } else if (this.getCell(row, col)) {
            throw new Error(`attempt to replay row/col ${row}/${col} by player ${this.whoseTurn}`);
        }
        this.setCell(row, col, this.whoseTurn);
        this.checkWin() || this.next();
    }

    checkWin () {
        for (let vector of VECTORS) {
            if (this.whoWon) {
                break;
            }
            let values = this.getVector.apply(this, vector.concat([samePlayer]));
            if (values.length === 3) {
                this.whoWon = values[0];
            }
        }
        return this.whoWon;
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
        if (!goodPlayer(val)) {
            throw new Error(`bad value for whoseTurn ${val}`);
        }
        this._whoseTurn = val;
    }

    /**
     *
     * @returns {Number}
     */
    get whoseTurn () {
        return this.whoWon ? 0 : this._whoseTurn;
    }

    next () {
        this.whoseTurn = this.whoseTurn === 1 ? 2 : 1;
        this.turn = this.turn + 1;
    }

    set
    channel (val) {
        this._channel = val;
    }

    get channel () {
        return this._channel;
    }

    set user1 (val) {
        this._user1 = val;
    }

    get user1 () {
        return this._user1 || '';
    }

    set user2 (val) {
        this._user2 = val;
    }

    get user2 () {
        return this._user2 || '';
    }

    /**
     *
     * @param val {array}
     */
    set board (val) {
        this._board = val;
    }

    /**
     *
     * @returns {Array.<T>}
     */
    get board () {
        return (this._board || []).slice(0);
    }

    set whoWon (val) {
        if (!goodPlayerOrNobody(val)) {
            throw new Error(`bad whoWon value ${val}`);
        }
        this._whoWon = val;
    }

    get whoWon () {
        return this._whoWon;
    }

    player (n, pad) {
        let player = '';
        switch(n) {
            case 1:
                player = this.user1;
                break;

            case 2:
                player = this.user2;
                break;
        }

        return pad ? this.pad(player || '', this.padSize()) : player;
    }

    pad(str, size) {
        if (!str) return _.pad('', size);
        return str.length >= size ? str.substring(0, size) : _.pad(str, size);
    }

    padSize () {
        let pad = 3;
        if (this.user1 !== this.user2) {
            while (this.user1 && this.user2 && (this.user1.substring(0, pad) === this.user2.substring(0, pad))) {
                ++pad;
            }
        }
        return pad;
    }

    toString () {
        let values = this.board;

        const v = (i) => `[${values[i] ? this.player(values[i], true) : _.pad(SLOTS[i].letter, this.padSize())}]`;

        return `
 -- ${this.user1} vs. ${this.user2} --
 
  ${v(0)}  |  ${v(1)}  |  ${v(2)}  
  ----------------------------
  ${v(3)}  |  ${v(4)}  |  ${v(5)}  
  ----------------------------
  ${v(6)}  |  ${v(7)}  |  ${v(8)}`;
    }
}

module
    .exports = (bottle) => {
    bottle.service('Game', function () {
        return Game;
    });
};
