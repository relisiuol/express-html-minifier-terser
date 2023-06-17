'use strict';

import express from 'express';
import HTMLMinifier from '../../minifier.js';
import { create } from 'express-handlebars';

var app = express();

var hbs = create({
    defaultLayout: 'main',
    layoutsDir:    './'
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './');

app.use(HTMLMinifier({
    override:      true,
    htmlMinifier: {
        removeComments:            true,
        collapseWhitespace:        true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes:     true,
        removeEmptyAttributes:     true,
        minifyJS:                  true
    }
}));

app.get('/', function(req, res) {
    res.render('main', { hello: 'world' });
});

var server = app.listen(3000, function() {
    var port = server.address().port;

    console.log('Handlebars example app listening on port %s', port);
});
