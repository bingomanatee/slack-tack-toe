var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

module.exports = () => {
    var app = express();

// view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
    app.use(favicon(path.join(__dirname, 'public', 'fav.ico')));

    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(cookieParser());
    app.use(require('node-sass-middleware')({
        src: path.join(__dirname, 'public'),
        dest: path.join(__dirname, 'public'),
        indentedSyntax: true,
        sourceMap: true
    }));
    return app;
}
