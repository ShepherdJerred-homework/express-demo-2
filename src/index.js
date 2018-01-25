const express = require('express');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const morgan = require('morgan');
const path = require('path');

const config = require('../config');

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded());
app.use(expressSession({
  secret: config.sessionSecret,
  cookie: {}
}));

app.post('/login', (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let login = config.passwords[username] === password;
  req.session.login = login;
  if (login) {
    res.redirect('/');
  } else {
    res.redirect('/login.html');
  }
});

app.use('/private', (req, res, next) => {
  if (req.session.login) {
    next();
  } else {
    res.redirect('/');
  }
});

app.use(express.static(path.join(__dirname, '../static')));

app.listen(config.serverPort, () => console.log('Listening on port 8000...'));
