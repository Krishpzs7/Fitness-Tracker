const express = require('express');
const router = express.Router();
const Profile = require('../models/profile');

// Show all profiles
router.get('/', async (req, res) => {
  const profiles = await Profile.find().sort({ createdAt: 'desc' });
  res.render('profiles', { profiles });
});

// Show form to create profile
router.get('/new', (req, res) => {
  res.render('newProfile');
});

// Process profile creation
router.post('/', async (req, res) => {
  const { name, height, weight } = req.body;
  await Profile.create({ name, height, weight });
  res.redirect('/workouts/new');
});

module.exports = router;
