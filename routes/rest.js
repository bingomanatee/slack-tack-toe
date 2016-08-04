"use strict";

var express = require('express');
var router = express.Router();
const _ = require('lodash');
const bottle = require('./../lib');
const reg = new bottle.container.Registry();
const manager = new bottle.container.Manager(reg);
manager.createGame('sampleChannel', 'sampleUser1', 'sampleUser2');

const config = require('../config.json');

/* GET users listing. */
router.post('/game/create', function (req, res, next) {
    const props = _.pick(req.body, 'channel_name,user_name,token'.split(','));
    console.log('creating game using ', req.body);
    if (!props.channel_name) {
         res.status(400).send({error: 'no channel_name'});
    } else if (props.token !== config.token) {
         res.status(400).send({error: 'unauthorized'});
    } else {
        const game = manager.createGame(props.channel_name, props.user_name);
        res.send(game.toJSON());
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
