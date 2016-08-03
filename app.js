"use strict";

const express = require('express');
var path = require('path');
const init = require('./initExpress');
var routes = require('./routes/index');
var rest = require('./routes/rest');
const _ = require('lodash');

const app = init();

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/rest', rest);

const cred = require('./auth.json');
const AUTH_URL = `https://slack.com/oauth/authorize?scope=channels:read and channels:write&client_id=${cred.client_id}&team=${encodeURI(cred.team)}`;

app.get('/auth', (req, res) => {
    console.log('body props: ', req.body);
    res.redirect(AUTH_URL);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
