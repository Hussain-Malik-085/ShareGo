require('dotenv').config({ path: './file.env' }); // Ensure the correct path to the environment file
require('dotenv').config();
console.log('MONGO_URI:', process.env.MONGO_URI);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan'); // Logger for development
const app = express();

// Import routes
const driverRoutes = require('./Routes/DriverRoute');
const riderRoutes = require('./Routes/RiderRoute');
const approveDriverRoutes = require('./Routes/approveDriverRoute');
const rejectDriverRoutes = require('./Routes/rejectDriverRoute'); // Import reject route
const riderDeleteRoutes = require('./Routes/Riderdelete'); 


// Debug route imports
console.log('Driver Routes:', driverRoutes);
console.log('Rider Routes:', riderRoutes);
console.log('Approve Driver Routes:', approveDriverRoutes);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));  // Logs request details in development
// Register routes
app.use('/drivers', driverRoutes);  // For the driver routes
app.use('/riders', riderRoutes);    // For the rider routes
app.use('/approve', approveDriverRoutes); 
app.use('/reject', rejectDriverRoutes); // Use the new reject route
app.use('/rider', riderDeleteRoutes);
// MongoDB connection
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/test';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1); // Exit process on MongoDB connection failure
    });

// Root route for server health check
app.get('/', (req, res) => {
    res.send('Server is running and ready to handle requests!');
    console.log('✅ Health check endpoint hit');
});



// 404 Route handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('❌ Global Error:', err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start the server
const PORT = process.env.PORT || 4000; 
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
