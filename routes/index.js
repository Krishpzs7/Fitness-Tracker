const express = require('express');
const router = express.Router();

const Workout = require('../models/workout');
const Profile = require('../models/profile');

// Dashboard route
router.get('/dashboard', async (req, res) => {
  try {
    const totalProfiles = await Profile.countDocuments();
    const totalWorkouts = await Workout.countDocuments();
    const totalCalories = await Workout.aggregate([
      { $group: { _id: null, total: { $sum: '$calories' } } }
    ]);

    const caloriesBurned = totalCalories[0] ? totalCalories[0].total : 0;

    res.render('dashboard', {
      totalProfiles,
      totalWorkouts,
      caloriesBurned
    });
  } catch (err) {
    console.error(err);
    res.send('Error loading dashboard');
  }
});

// (Keep other routes below here)

module.exports = router;
