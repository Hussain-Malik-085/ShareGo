// routes/riderRoutes.js
const express = require('express');
const router = express.Router();
const riderController = require('../Controller/RiderControl');

// Rider routes
router.get('/', riderController.getAllRiders);
router.get('/:id', riderController.getRiderById);
router.post('/', riderController.createRider);
router.put('/:id', riderController.updateRider);
router.delete('/:id', riderController.deleteRider);

module.exports = router;
