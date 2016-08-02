"use strict";

var tap = require('tap');
const Bottle = require('bottlejs');
const gameFactory = require('./../lib/gameFactory');

tap.test('Game', (suite) => {

    const bottle = new Bottle();
    gameFactory(bottle);
    const Game = bottle.container.Game;

    suite.test('constructor', (cAssert) => {
        const game = new Game('foo', 'bar', 'vey');

        cAssert.equal(game.channel, 'foo', 'channel set to foo');
        cAssert.equal(game.user1, 'bar', 'user1 set to bar');
        cAssert.equal(game.user2, 'vey', 'user2 set to vey');
        cAssert.deepEqual(game.board, [0, 0, 0,
            0, 0, 0,
            0, 0, 0], 'board is an array of zeros');
        cAssert.end();
    });

    suite.test('turn', (tAssert) => {
        const game = new Game('foo', 'bar', 'vey');

        tAssert.equal(game.turn, 0, 'starts on turn 0');
        tAssert.equal(game.whoseTurn, 1, 'starts on first player\'s turn');

        game.next();

        tAssert.equal(game.turn, 1, 'advances to turn 1');
        tAssert.equal(game.whoseTurn, 2, 'goes to second player\'s turn');

        game.next();

        tAssert.equal(game.turn, 2, 'advances to turn 2');
        tAssert.equal(game.whoseTurn, 1, 'goes to first player\'s turn');

        tAssert.end();
    });

    suite.test('move', (mAssert) => {
        mAssert.test('illegal move', (mAssertIllegal) => {
            const game = new Game('foo', 'bar', 'vey');
            try {
                game.move(-1, 0);
                mAssertIllegal.fail('should not be accepted');
            } catch (err) {
                mAssertIllegal.equal(err.message, 'bad row/col -1/0', 'error message from illegal move');
            }
            mAssertIllegal.equal(game.turn, 0, 'turn not advanced');
            mAssertIllegal.equal(game.whoseTurn, 1, 'still player 1\'s turn');
            mAssertIllegal.end();
        });

        mAssert.test('good move', (mAssertGood) => {
            const game = new Game('foo', 'bar', 'vey');
            game.move(1, 0);
            mAssertGood.equal(game.turn, 1, 'advances to turn 1');
            mAssertGood.equal(game.whoseTurn, 2, 'goes to second player\'s turn');
            mAssertGood.deepEqual(game.board, [0, 0, 0,
                1, 0, 0,
                0, 0, 0], 'registered play on board');
            mAssertGood.end();
        });

        mAssert.test('two moves', (mAssert2moves) => {
            const game = new Game('foo', 'bar', 'vey');
            game.move(1, 0);
            game.move(1, 1);
            mAssert2moves.equal(game.turn, 2, 'advances to turn 2');
            mAssert2moves.equal(game.whoseTurn, 1, 'goes back to first player\'s turn');
            mAssert2moves.deepEqual(game.board, [0, 0, 0,
                1, 2, 0,
                0, 0, 0], 'registered play on board');
            mAssert2moves.end();
        });

        mAssert.test('repeated move', (mAssertRepeat) => {
            const game = new Game('foo', 'bar', 'vey');
            game.move(1, 0);
            try {
                game.move(1, 0);
                mAssertRepeat.fail('should not get past repeat move');
            } catch (err) {
                mAssertRepeat.equal(err.message, 'attempt to replay row/col 1/0 by player 2',
                    'error message from repeated move');
            }

            mAssertRepeat.end();
        });

        mAssert.end();
    });

    suite.test('vector', (mVector) => {
        const game = new Game('alpha', 'beta', 'gamma');

        game.board = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        // creating an artificial sequence for /easy testing

        mVector.deepEqual(game.getVector(0, 0, 0, 1), [1, 2, 3], 'getting a row');
        mVector.deepEqual(game.getVector(0, 0, 1, 0), [1, 4, 7], 'getting a column');
        mVector.deepEqual(game.getVector(2, 0, -1, 1), [7, 5, 3], 'getting an upward diagonal');

        mVector.end();
    });

    suite.test('vector (with test)', (mVector) => {
        const game = new Game('alpha', 'beta', 'gamma');

        game.board = [
            1, 2, 0,
            2, 1, 0,
            0, 0, 1];
        // creating an artificial sequence for /easy testing

        function samePlayer (played, r, c, val) {
            let out = true;
            if (!val) {
                console.log('stopping at val 0: ');
                out = false;
            } else if (played.length) {
                out = val === played[0];// all values are the same.
            }
            return out;
        }

        mVector.deepEqual(game.getVector(0, 0, 0, 1, samePlayer), [1], 'getting a row');
        mVector.deepEqual(game.getVector(1, 0, 0, 1, samePlayer), [2], 'getting a row');
        mVector.deepEqual(game.getVector(0, 0, 1, 0, samePlayer), [1], 'getting a column');
        mVector.deepEqual(game.getVector(0, 0, 1, 1, samePlayer), [1, 1, 1], 'getting a diagonal');

        mVector.end();
    });

    suite.end();
});
