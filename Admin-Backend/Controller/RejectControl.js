const mongoose = require('mongoose');
const Driver = require('../Models/Driver');

// Reject driver for verification
exports.rejectDriverVerification = async (req, res) => {
  const { id } = req.params; // Extract driver ID from the request URL
  const { verification } = req.body; // Extract verification status

  if (!id || verification !== 'rejected') {
    return res.status(400).json({
      success: false,
      message: 'Invalid request. ID and "rejected" status are required.',
    });
  }

  try {
    const updatedDriver = await Driver.findByIdAndUpdate(
      id,
      { verification: 'rejected' },
      { new: true }
    );

    if (!updatedDriver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Driver verification status updated to "rejected".',
      updatedDriver,
    });
  } catch (err) {
    console.error('Error rejecting driver:', err);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err.message,
    });
  }
};
