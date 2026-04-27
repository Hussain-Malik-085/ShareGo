const express = require('express');
const router = express.Router();
const Rider = require('../Models/Rider'); // Ensure correct model import

// DELETE rider by ID
router.delete('/deleteRider/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Deleting rider with ID: ${id}`);  // Debugging log

        const deletedRider = await Rider.findByIdAndDelete(id);

        if (!deletedRider) {
            return res.status(404).json({ message: 'Rider not found' });
        }

        res.json({ message: 'Rider deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting rider', error: error.message });
    }
});

module.exports = router;
