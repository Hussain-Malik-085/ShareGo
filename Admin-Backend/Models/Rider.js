const mongoose = require("mongoose");

// Check if the model is already registered
const Rider = mongoose.models.Rider || mongoose.model("Rider", new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    dob: { type: Date, required: true },
  },
  { timestamps: true }
));

module.exports = Rider;
