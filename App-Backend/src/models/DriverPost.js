const mongoose = require('mongoose');

const driverPostSchema = new mongoose.Schema(
  {
    driverId: {type: String, required: true},
    vehicleType: String,
    startLocation: Object,
    endLocation: Object,
    distance: Number,
    totalFare: Number,
    commissionFare: Number,
    pickup: String,
    dropoff: String,
    rideDateTime: String,
    booked: {type: Boolean, default: false},
    riderId: {type: String, default: null},
    riderName: {type: String, default: null},
  },
  {timestamps: true}
);

module.exports = mongoose.model('DriverPost', driverPostSchema);
