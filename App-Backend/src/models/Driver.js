const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    basicInfo: { type: Object, default: {} },
    cnic: { type: Object, default: {} },
    license: { type: Object, default: {} },
    vehicle: { type: Object, default: {} },
    verification: { type: String, default: 'pending' },
  },
  {timestamps: true}
);

module.exports = mongoose.model('Driver', driverSchema);
