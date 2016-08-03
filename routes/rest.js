"use strict";

var express = require('express');
var router = express.Router();
const _ = require('lodash');
const bottle = require('./../lib');
const reg = new bottle.container.Registry();
const manager = new bottle.container.Manager(reg);
manager.createGame('sampleChannel', 'sampleUser1', 'sampleUser2');

/* GET users listing. */
router.post('/game/create', function(req, res, next) {
    const props = _.pick(req.body, 'channel,user1,user2'.split(','));
    const game = manager.createGame(props.channel, props.user1, props.user2);
    res.send(game.toJSON());
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
