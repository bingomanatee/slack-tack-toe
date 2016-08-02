"use strict";

var Registry = require('./Registry');
var managerFactory = require('./managerFactory');
var gameFactory = require('./gameFactory');

var Bottle = require('bottlejs');
var bottle = new Bottle();

bottle.service('Registry', Registry);
managerFactory(bottle);
gameFactory(bottle);

module.exports = bottle;
