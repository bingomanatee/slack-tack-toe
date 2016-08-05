"use strict";

var express = require('express');
var router = express.Router();
const _ = require('lodash');
const bottle = require('./../lib');
const reg = new bottle.container.Registry();
const manager = new bottle.container.Manager(reg);
manager.createGame('sampleChannel', 'sampleUser1', 'sampleUser2');

const config = require('../config.json');

/* POST join a game. */
router.post('/game/join', (req, res) => {
    const props = _.pick(req.body, 'channel_name,user_name,token'.split(','));
    console.log('joining game using ', req.body);
    if (!props.channel_name) {
        res.status(400).send({error: 'no channel_name'});
    } else if (props.token !== config.tokens.join) {
        res.status(400).send({error: 'unauthorized'});
    } else if (!manager.hasGame(props.channel_name)) {
        res.send(config.strings.NO_GAME);
    } else {
        try { // will throw error if no game found -- OR if the game is in progress.
            // note -- you CAN "Join your own game" -- play solitare.
            const game = manager.joinGame(props.channel_name, props.user_name);
            res.send(config.strings.ON_JOIN.replace(/user1/g, game.user2) + game.toString());
        } catch (err) {
            res.send(err.message);
        }
    }
});


/* POST initiate a game. */
router.post('/game/create', function (req, res, next) {
    const props = _.pick(req.body, 'channel_name,user_name,token'.split(','));
    console.log('creating game using ', req.body);
    if (!props.channel_name) {
        res.status(400).send({error: 'no channel_name'});
    } else if (props.token !== config.tokens.create) {
        res.status(400).send({error: 'unauthorized'});
    } else if (manager.hasGame(props.channel_name)) {
        res.send(config.strings.IN_PROGRESS);
    } else {
        const game = manager.createGame(props.channel_name, props.user_name);
        // at this point the creator is user1.
        // @TODO: "Host mode" where two other players can play

        let prompt = `${config.strings.JOIN_PROMPT}
${config.strings.WHEN_START}`;
        if (game.user1) {
            if (game.user2) {
                prompt = `${game.user1} it is your turn to play.
${config.strings.PLAY_EXAMPLE}`;
            }
        }
        res.send(`${config.strings.HAVE_STARTED}

${game.toString()}

${prompt}`);
    }
});

router.get('/', (req, res) => {
    const games = manager.reg.values();
    const gameList = [];
    for (let game of games) {
        gameList.push(game.toJSON());
    }
    res.send(gameList);
});

module.exports = router;
