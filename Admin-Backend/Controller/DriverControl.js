const Driver = require('../Models/Driver');

// Fetch all drivers
exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.status(200).json(drivers);
  } catch (err) {
    console.error('Error fetching drivers:', err); // Log for debugging
    res.status(500).json({ success: false, message: 'Failed to fetch drivers' });
  }
};

// Fetch a single driver by ID
exports.getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.status(200).json(driver);
  } catch (err) {
    console.error('Error fetching driver by ID:', err); // Log for debugging
    res.status(500).json({ success: false, message: 'Failed to fetch driver' });
  }
};
// Create a new driver
exports.createDriver = async (req, res) => {
  try {
    const newDriver = new Driver(req.body); // Add validation here if needed
    const savedDriver = await newDriver.save();
    res.status(201).json(savedDriver);
  } catch (err) {
    console.error('Error creating driver:', err); // Log for debugging
    res.status(500).json({ success: false, message: 'Failed to create driver' });
  }
};

// Update a driver by ID
exports.updateDriver = async (req, res) => {
  try {
    const updatedDriver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedDriver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.status(200).json(updatedDriver);
  } catch (err) {
    console.error('Error updating driver:', err); // Log for debugging
    res.status(500).json({ success: false, message: 'Failed to update driver' });
  }
};

// Delete a driver by ID
exports.deleteDriver = async (req, res) => {
  try {
    const deletedDriver = await Driver.findByIdAndDelete(req.params.id);
    if (!deletedDriver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.status(200).json({ success: true, message: 'Driver deleted successfully' });
  } catch (err) {
    console.error('Error deleting driver:', err); // Log for debugging
    res.status(500).json({ success: false, message: 'Failed to delete driver' });
  }
};
