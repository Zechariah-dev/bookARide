const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser')
const hbs = require('hbs');
const mongoose = require('mongoose');
require('dotenv').config();

const db = require('./config/database');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const driversRouter = require('./routes/drivers');

const app = express();

// Map global promise - get rid of warning
mongoose.Promise = global.Promise;

mongoose.connect(db.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Database Connected'))
  .catch(err => console.log(err));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/drivers', driversRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
