const express = require('express');
const router = express.Router();
const approveDriverController = require('../Controller/ApproveControl'); // Ensure the path is correct
// Approve driver for verification (with ID in URL)
router.put('/approveVerification/:id', approveDriverController.approveDriverForVerification);
module.exports = router;
