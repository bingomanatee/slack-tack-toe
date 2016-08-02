"use strict";

/**
 This is the controller that manages the logic for all
 the games.
 */

var Bottle = require('bottlejs');
var Registry = require('./Registry');
var managerFactory = require('./managerFactory');
var gameFactory = require('./gameFactory');

var bottle = new Bottle();

bottle.service('Registry', Registry);

managerFactory(bottle);
gameFactory(bottle);

module.exports = bottle;
