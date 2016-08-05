"use strict";

var tap = require('tap');
var Bottle = require('bottlejs');

let managerFactory = require('./../lib/managerFactory');

tap.test('managerFactory', (suite) => {
    const bottle = new Bottle();
    // a mock game.
    class Game {
        constructor (channel, user1, user2) {
            this.channel = channel;
            this.user1 = user1;
            this.user2 = user2;
        }
    }
    bottle.service('Game', function () {
        return Game;
    });

    // a mock registry; note at this point the registry really is just a map instance, but if it grows bigger,
    // we will be able to mock/stub stuff here.
    bottle.service('Registry', function () {
        return Map;
    });
    managerFactory(bottle);

    const Manager = bottle.container.Manager;

    suite.test('constructor', (cAssert) => {
        let man = new Manager(new bottle.container.Registry);

        cAssert.ok(typeof man.reg === 'object');
        cAssert.end();
    });

    suite.test('createGame', (gAssert) => {
        const man = new Manager(new bottle.container.Registry());

        const firstGame = man.createGame('alpha', 'p1', 'p2');
        gAssert.equal(firstGame.channel, 'alpha', 'Game has channel alpha');

        gAssert.test('createGame (second game)', (gAssert2) => {
            const man = new Manager(new bottle.container.Registry());

            man.createGame('alpha', 'p1', 'p2');
            try {
                man.createGame('alpha', 'p1', 'p2');
                gAssert2.fail('cannot create second game with the same channel');
            } catch (err) {
                gAssert2.equal(err.message, 'game in play', 'throws if game is in play');
            }
            gAssert2.end();
        });

        gAssert.test('createGame (second game, different channel)', (gAssert3) => {
            const man = new Manager(new bottle.container.Registry());

            man.createGame('alpha', 'p1', 'p2');
            const betaGame = man.createGame('beta', 'p1', 'p2');
            gAssert3.equal(betaGame.channel, 'beta', 'beta game created');
            // really just care that second game is not blocked.

            gAssert3.end();
        });

        gAssert.test('createGame (second game after first game ended)', (gAssert4) => {
            const man = new Manager(new bottle.container.Registry());

            const firstGame = man.createGame('alpha', 'p1', 'p2');
            man.endGame(firstGame);
            let newAlphaGame = man.createGame('alpha', 'p3', 'p4');
            gAssert4.equal(newAlphaGame.channel, 'alpha', 'recreated game alpha');
            gAssert4.equal(newAlphaGame.user1, 'p3', 'old data replaced');

            gAssert4.end();
        });
        gAssert.end();
    });

    suite.test('join', (jAssert) => {

        // failed attempt to join game in a channel that has not been initialized
        jAssert.test('on game that does not exist', (nAssert) => {
            let man = new Manager(new bottle.container.Registry);

            try {
                man.joinGame('dutchman', 'foo');
            } catch (err) {
                nAssert.equal(err.message, 'cannot find game in channel dutchman');
            }

            nAssert.end();
        });

        // failed attempt to join a game in progress
        jAssert.test('on game that already has a user2', (fullAssert) => {
            let man = new Manager(new bottle.container.Registry);
            man.createGame('dutchman', 'u1', 'u2');

            try {
                man.joinGame('dutchman', 'foo');
            } catch (err) {
                fullAssert.equal(err.message, 'user2 has already been selected (u2)');
            }

            fullAssert.end();
        });

        // succeeds; game slot is taken.
        jAssert.test('on game that doesn\'t have a user2', (goodAssert) => {
            let man = new Manager(new bottle.container.Registry);
            let game = man.createGame('dutchman', 'u1');
            man.joinGame('dutchman', 'foo');
            goodAssert.equal(game.user2, 'foo', 'foo has joined');

            goodAssert.end();
        });

        jAssert.end();
    });

    suite.end();
});
