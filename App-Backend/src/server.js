require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const apiRouter = require('./routes/api');
const Driver = require('./models/Driver');
const Rider = require('./models/Rider');

const PORT = Number(process.env.PORT) || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sharego';

const app = express();
app.use(cors());
app.use(express.json({limit: '10mb'}));

app.get('/', (req, res) => {
  res.json({ok: true, name: 'ShareGo API', version: 1});
});

app.use('/api', apiRouter);

/** Admin panel (no /api prefix – same as your React admin code) */
app.get('/drivers', async (req, res) => {
  try {
    const data = await Driver.find().lean();
    res.json(data);
  } catch (e) {
    res.status(500).json({message: e.message});
  }
});

app.get('/riders', async (req, res) => {
  try {
    const data = await Rider.find().lean();
    res.json(data);
  } catch (e) {
    res.status(500).json({message: e.message});
  }
});

app.put('/approve/approveVerification/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({message: 'Invalid id'});
    }
    const {verification} = req.body;
    const doc = await Driver.findByIdAndUpdate(
      req.params.id,
      {$set: {verification: verification || 'verified'}},
      {new: true}
    );
    if (!doc) return res.status(404).json({message: 'Driver not found'});
    res.json({message: 'Updated', driver: doc});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
});

app.put('/reject/rejectVerification/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({message: 'Invalid id'});
    }
    const {verification} = req.body;
    const doc = await Driver.findByIdAndUpdate(
      req.params.id,
      {$set: {verification: verification || 'rejected'}},
      {new: true}
    );
    if (!doc) return res.status(404).json({message: 'Driver not found'});
    res.json({message: 'Updated', driver: doc});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
});

app.delete('/reject/deleteDriver/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({message: 'Invalid id'});
    }
    const r = await Driver.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({message: 'Not found'});
    const DriverPost = require('./models/DriverPost');
    await DriverPost.deleteMany({driverId: req.params.id});
    res.json({message: 'Deleted'});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
});

app.delete('/rider/deleteRider/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({message: 'Invalid id'});
    }
    const r = await Rider.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({message: 'Not found'});
    const RiderPost = require('./models/RiderPost');
    await RiderPost.deleteMany({riderId: req.params.id});
    res.json({message: 'Deleted'});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
});

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');
  } catch (e) {
    console.error('MongoDB connect failed:', e.message);
    process.exit(1);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ShareGo API http://0.0.0.0:${PORT}`);
  });
}

start();
