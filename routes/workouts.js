const express = require('express');
const router = express.Router();
const Workout = require('../models/workout');
const Profile = require('../models/profile');

// Show all workouts with dashboard data
router.get('/', async (req, res) => {
  try {
    const workouts = await Workout.find().populate('profile').sort({ date: 'desc' });

    const workoutsWithBMI = workouts.map(workout => {
      if (workout.profile) {
        const heightInMeters = workout.profile.height / 100;
        const bmi = workout.profile.weight / (heightInMeters * heightInMeters);

        let bmiCategory = '';
        if (bmi < 18.5) {
          bmiCategory = 'Underweight';
        } else if (bmi < 25) {
          bmiCategory = 'Normal';
        } else if (bmi < 30) {
          bmiCategory = 'Overweight';
        } else {
          bmiCategory = 'Obese';
        }

        return {
          ...workout.toObject(),
          bmiCategory
        };
      } else {
        return {
          ...workout.toObject(),
          bmiCategory: 'N/A'
        };
      }
    });

    const totalProfiles = await Profile.countDocuments();
    const totalWorkouts = await Workout.countDocuments();
    const totalCaloriesData = await Workout.aggregate([
      { $group: { _id: null, total: { $sum: '$calories' } } }
    ]);
    const totalCalories = totalCaloriesData[0] ? totalCaloriesData[0].total : 0;

    res.render('workouts', {
      workouts: workoutsWithBMI,
      totalProfiles,
      totalWorkouts,
      totalCalories
    });
  } catch (err) {
    console.error(err);
    res.send('Error fetching workouts');
  }
});

// Show form to create new workout
router.get('/new', async (req, res) => {
  try {
    const profiles = await Profile.find();

    if (profiles.length === 0) {
      return res.redirect('/profiles/new');
    }

    res.render('newWorkout', { profiles });
  } catch (err) {
    console.error(err);
    res.send('Error loading profiles');
  }
});

// Process new workout form with BMI and calorie calculation
router.post('/', async (req, res) => {
  try {
    const { title, duration, profileId } = req.body;
    const profile = await Profile.findById(profileId);

    if (!profile) {
      return res.send('Profile not found');
    }

    const heightInMeters = profile.height / 100;
    const bmi = profile.weight / (heightInMeters * heightInMeters);

    let met;
    if (bmi < 18.5) met = 4;
    else if (bmi < 25) met = 5;
    else if (bmi < 30) met = 6;
    else met = 7;

    const calories = duration * met * profile.weight * 0.0175;

    await Workout.create({
      title,
      duration,
      calories: Math.round(calories),
      profile: profile._id
    });

    res.redirect('/workouts');
  } catch (err) {
    console.error(err);
    res.send('Error creating workout');
  }
});

// Show form to edit a workout
router.get('/edit/:id', async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    const profiles = await Profile.find();
    res.render('editWorkout', { workout, profiles });
  } catch (err) {
    console.error(err);
    res.send('Error finding workout');
  }
});

// Update a workout
router.put('/:id', async (req, res) => {
  try {
    const { title, duration, profileId } = req.body;
    const profile = await Profile.findById(profileId);

    if (!profile) {
      return res.send('Profile not found');
    }

    const heightInMeters = profile.height / 100;
    const bmi = profile.weight / (heightInMeters * heightInMeters);

    let met;
    if (bmi < 18.5) met = 4;
    else if (bmi < 25) met = 5;
    else if (bmi < 30) met = 6;
    else met = 7;

    const calories = duration * met * profile.weight * 0.0175;

    await Workout.findByIdAndUpdate(req.params.id, {
      title,
      duration,
      calories: Math.round(calories),
      profile: profile._id
    });

    res.redirect('/workouts');
  } catch (err) {
    console.error(err);
    res.send('Error updating workout');
  }
});

// Delete a workout
router.delete('/:id', async (req, res) => {
  try {
    await Workout.findByIdAndDelete(req.params.id);
    res.redirect('/workouts');
  } catch (err) {
    console.error(err);
    res.send('Error deleting workout');
  }
});

module.exports = router;
