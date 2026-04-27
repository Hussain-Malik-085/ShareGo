const mongoose = require('mongoose');

const riderPostSchema = new mongoose.Schema(
  {
    riderId: {type: String, required: true},
    vehicleType: String,
    startLocation: Object,
    endLocation: Object,
    pickupCoords: Object,
    destCoords: Object,
    distance: Number,
    totalFare: Number,
    commissionFare: Number,
    pickup: String,
    dropoff: String,
    rideDateTime: String,
    booked: {type: Boolean, default: false},
    driverId: {type: String, default: null},
    driverName: {type: String, default: null},
    driverNumber: {type: String, default: null},
    driverVechileNumber: {type: String, default: null},
    driverVechileColor: {type: String, default: null},
    driverVechileModel: {type: String, default: null},
  },
  {timestamps: true}
);

module.exports = mongoose.model('RiderPost', riderPostSchema);
