const express = require('express');
const router = express.Router();
const rejectDriverController = require('../Controller/RejectControl'); // Controller for rejection
const Driver = require('../Models/Driver'); // Ensure correct path to the Driver model

// Reject driver for verification (Update status to "rejected")
router.put('/rejectVerification/:id', rejectDriverController.rejectDriverVerification);

// DELETE route to permanently remove a driver from the database
router.delete('/deleteDriver/:id', async (req, res) => {
  try {
    const result = await Driver.findByIdAndDelete(req.params.id);
    
    if (!result) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting driver', error });
  }
});

module.exports = router;
