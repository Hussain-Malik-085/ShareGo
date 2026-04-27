const mongoose = require('mongoose');
const Driver = require('../Models/Driver');

// Approve driver for verification
exports.approveDriverForVerification = async (req, res) => {
    const { verification } = req.body;
    const driverId = req.params.id; // Get driver ID from route parameters

    // Validate input
    if (!driverId || !verification) {
        return res.status(400).json({
            success: false,
            message: 'Driver ID and verification status are required.'
        });
    }

    if (verification !== 'verified') {
        return res.status(400).json({
            success: false,
            message: 'Only "verified" status is allowed for approval.'
        });
    }

    if (!mongoose.Types.ObjectId.isValid(driverId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid ObjectId provided.'
        });
    }

    try {
        // Update driver's verification status
        const updatedDriver = await Driver.findByIdAndUpdate(
            driverId,
            { verification: 'verified' }, // Update verification status
            { new: true } // Return updated document
        );

        if (!updatedDriver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Driver verification status updated successfully.',
            updatedDriver
        });
    } catch (err) {
        console.error('Error approving driver:', err);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: err.message
        });
    }
};
