const express = require('express');
const { execFile } = require('child_process');
const escapeHtml = require('escape-html');
const _ = require('lodash');

const app = express();
const hostnamePattern = /^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)(?:\.(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?))*$/;

app.set('query parser', 'extended');


app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/hello', (req, res) => {
  const name = req.query.name || 'inconnu';
  res.send(`<h1>Bonjour ${escapeHtml(name)}</h1>`);
});

app.get('/ping', (req, res) => {
  const host = req.query.host;
  if (typeof host !== 'string' || !hostnamePattern.test(host)) {
    return res.status(400).send('Hôte invalide');
  }

  execFile('ping', ['-c', '1', host], (err, stdout) => {
    if (err) return res.status(502).send('Erreur');
    res.type('text').send(stdout);
  });
});

app.get('/prefs', (req, res) => {
  const defaults = { theme: 'light', lang: 'fr' };
  const allowedPreferences = _.pick(req.query, ['theme', 'lang']);
  res.json({ ...defaults, ...allowedPreferences });
});

module.exports = app;
