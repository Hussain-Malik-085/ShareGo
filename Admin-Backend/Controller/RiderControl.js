// controllers/riderController.js
const Rider = require('../models/Rider');

// Fetch all riders
exports.getAllRiders = async (req, res) => {
  try {
    const riders = await Rider.find();
    res.status(200).json(riders);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Fetch a single rider by ID
exports.getRiderById = async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.id);
    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }
    res.status(200).json(rider);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new rider
exports.createRider = async (req, res) => {
  try {
    const newRider = new Rider(req.body);
    const savedRider = await newRider.save();
    res.status(201).json(savedRider);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update a rider by ID
exports.updateRider = async (req, res) => {
  try {
    const updatedRider = await Rider.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRider) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }
    res.status(200).json(updatedRider);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a rider by ID
exports.deleteRider = async (req, res) => {
  try {
    const deletedRider = await Rider.findByIdAndDelete(req.params.id);
    if (!deletedRider) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }
    res.status(200).json({ success: true, message: 'Rider deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
