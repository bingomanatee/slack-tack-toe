var express = require('express');
var router = express.Router();
const _ = require('lodash');
const game = require('./../lib');

/* GET users listing. */
router.post('/game/create', function(req, res, next) {
    const props = _.pick(req.body, '')
});

module.exports = router;
