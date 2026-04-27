const mongoose = require('mongoose');


// Define schemas for modularity

// Schema for Basic Information
const basicInfoSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  address: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  profileImage: { type: String }, // Stores the Cloudinary URL for the profile picture
  //_id: { type: mongoose.Schema.Types.ObjectId, required: true }
});

// Schema for CNIC Information
const cnicSchema = new mongoose.Schema({
  cnicNumber: { type: String, required: true, unique: true },
  frontImage: { type: String, required: true }, // Stores the Cloudinary URL for front image
  backImage: { type: String, required: true },  // Stores the Cloudinary URL for back image
});
// Schema for License Information
const licenseSchema = new mongoose.Schema({
  licenseNumber: { type: String, required: true, unique: true },
  issueDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  frontImage: { type: String, required: true }, // Cloudinary URL
  backImage: { type: String, required: true },  // Cloudinary URL
});
// Schema for Vehicle Images
const vehicleImagesSchema =new mongoose.Schema({
  front: { type: String, required: false }, // Cloudinary URLs
  right: { type: String, required: false },
  left: { type: String, required: false },
  back: { type: String, required: false }, // Embedded schema for images
})
// Schema for Vehicle Information
const bikeInfoSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true },
  company: { type: String, required: true },
  model: { type: String, required: true },
  chassisNumber: { type: String, required: true },
  engineNumber: { type: String, required: true },
  front: { type: String, required: false }, // Cloudinary URLs
  right: { type: String, required: false },
  left: { type: String, required: false },
  back: { type: String, required: false }, // Embedded schema for images
});
const carInfoSchema = new mongoose.Schema({
  company: { type: String, required: true },
  model: { type: String, required: true },
  chassisNumber: { type: String, required: true },
  engineNumber: { type: String, required: true },
  images: vehicleImagesSchema, // Embedded schema for images
});

// Main Driver Schema
const driverSchema = new mongoose.Schema({
  basicInfo: basicInfoSchema,    // Embeds Basic Info
  cnic: cnicSchema,              // Embeds CNIC Info
  license: licenseSchema,        // Embeds License Info
  vehicle: {
    type: { type: String, enum: ['Bike', 'Car'], required: true }, // Bike or Car
    bikeInfo: bikeInfoSchema,    // Embedded Bike Info
    carInfo: carInfoSchema,      // Embedded Car Info
  },
 
  verification: { 
    type: String, 
  enum: ['pending', 'verified', 'rejected'], 
   default: 'pending' 
  },
});

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
