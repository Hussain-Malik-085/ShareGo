// routes/driverRoutes.js
const express = require('express');
const router = express.Router();
const driverController = require('../Controller/DriverControl'); // Update the path as needed

// Define driver routes
router.get('/', driverController.getAllDrivers);
router.get('/:id', driverController.getDriverById);
router.post('/', driverController.createDriver);
router.put('/:id', driverController.updateDriver);
router.delete('/:id', driverController.deleteDriver);

// Export the router
module.exports = router;


//router.put('/drivers/approve/:id', driverController.approveDriverForVerification);
//router.put('/drivers/approve',driverController.approveDriverForVerification);
//router.put('/verification', driverController.updateDriverVerification);
//router.put('/approve', driverController.approveDriverForVerification);
