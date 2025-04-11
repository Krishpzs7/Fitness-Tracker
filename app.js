const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const hbs = require('hbs');
const helpers = require('handlebars-helpers')();

dotenv.config();

hbs.registerHelper('json', function(context) {
  return JSON.stringify(context);
});

hbs.registerHelper('divide', function (a, b) {
  return a / b;
});

hbs.registerHelper('multiply', function (a, b) {
  return a * b;
});

hbs.registerHelper('lt', function (a, b) {
  return a < b;
});

hbs.registerHelper('gt', function (a, b) {
  return a > b;
});

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'hbs');

app.use(session({
  secret: 'fitnesssecret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB Connected');
}).catch(err => {
  console.error('MongoDB Connection Error:', err);
});

app.use('/', require('./routes/workouts'));
app.use('/workouts', require('./routes/workouts'));
app.use('/profiles', require('./routes/profiles'));

console.log('Server setup complete, about to listen...');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
