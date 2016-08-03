"use strict";

var express = require('express');
var router = express.Router();
var config = require('./../config.json');
var info = require('./../info.json');
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', config);
});

router.get('/info', (req, res) => {
    res.render('info', info);
});

module.exports = router;
