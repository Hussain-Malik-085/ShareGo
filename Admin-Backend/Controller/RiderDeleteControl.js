const Rider = require('../Models/Rider'); // Import Rider Model

// Function to delete a rider
const deleteRider = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the rider exists
    const deletedRider = await Rider.findByIdAndDelete(id);

    if (!deletedRider) {
      return res.status(404).json({ message: 'Rider not found' });
    }

    res.status(200).json({ message: 'Rider permanently deleted' });
  } catch (error) {
    console.error('Error deleting rider:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { deleteRider };
