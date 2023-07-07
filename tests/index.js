'use strict';

import express from 'express';
import request from 'supertest';
import test from 'tape';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import HTMLMinifier from '../minifier.js';
import { create } from 'express-handlebars';
import nunjucks from 'nunjucks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const expectedHTML = fs.readFileSync(__dirname + '/test.output.html', 'utf8');
const expectedRawHTML = {
  default: fs.readFileSync(__dirname + '/test.output.raw.html', 'utf8'),
  pug: fs.readFileSync(__dirname + '/test.output.raw.pug.html', 'utf8'),
  handlebars: fs.readFileSync(__dirname + '/test.output.raw.handlebars.html', 'utf8')
};

const hbs = create({
  defaultLayout: 'test',
  layoutsDir: __dirname
});

const app = express();

app.engine('handlebars', hbs.engine);

app.locals.pretty = true;
app.set('views', __dirname);

app.use(HTMLMinifier({
  override: true,
  exception_url: ['skip-minify'],
  htmlMinifier: {
    removeComments: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeAttributeQuotes: true,
    removeEmptyAttributes: true,
    minifyJS: true
  }
}));

app.get('/test', function (req, res, next) {
  res.render('test', { hello: 'world' });
});

app.get('/skip-minify', function (req, res, next) {
  res.render('test', { hello: 'world' });
});

function checkMinified(t) {
  request(app)
    .get('/test')
    .expect(200)
    .end(function (_err, res) {
      t.equal(res.text, expectedHTML);
      t.end();
    });
}

function checSkipMinified(t, engine) {
  request(app)
    .get('/skip-minify')
    .expect(200)
    .end(function (_err, res) {
      const raw = expectedRawHTML[engine] || expectedRawHTML.default;
      t.equal(res.text.trim(), raw.trim());
      t.end();
    });
}

test('Should minify EJS templates', function (t) {
  app.set('view engine', 'ejs');

  checkMinified(t);
});
test('Should skip minify EJS templates', function (t) {
  app.set('view engine', 'ejs');

  checSkipMinified(t, 'ejs');
});

test('Should minify Pug templates', function (t) {
  app.set('view engine', 'pug');

  checkMinified(t);
});
test('Should skip minify Pug templates', function (t) {
  app.set('view engine', 'pug');

  checSkipMinified(t, 'pug');
});

test('Should minify Handlebars templates', function (t) {
  app.set('view engine', 'handlebars');

  checkMinified(t);
});
test('Should skip minify Handlebars templates', function (t) {
  app.set('view engine', 'handlebars');

  checSkipMinified(t, 'handlebars');
});

app.engine('nunjucks', nunjucks.render);

test('Should minify Nunjucks templates', function (t) {
  app.set('view engine', 'nunjucks');

  checkMinified(t);
});
test('Should skip minify Nunjucks templates', function (t) {
  app.set('view engine', 'nunjucks');

  checSkipMinified(t);
});
