const express = require('express');
const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const Rider = require('../models/Rider');
const DriverPost = require('../models/DriverPost');
const RiderPost = require('../models/RiderPost');

const router = express.Router();

const fuelHandler = (req, res) => {
  const petrol = process.env.PETROL_PRICE_DISPLAY || 'Rs. 280/Ltr';
  res.json({prices: {petrol: petrol}});
};

router.get('/Fuel-price', fuelHandler);

/** Drivers */
router.post('/drivers', async (req, res) => {
  try {
    const doc = new Driver(req.body);
    await doc.save();
    res.status(201).json({
      id: doc._id.toString(),
      message: 'Driver created successfully',
    });
  } catch (e) {
    res.status(400).json({message: e.message || 'Invalid driver data'});
  }
});

router.get('/drivers/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({message: 'Invalid id'});
    }
    const doc = await Driver.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({message: 'Driver not found'});
    res.json(doc);
  } catch (e) {
    res.status(500).json({message: e.message});
  }
});

router.delete('/drivers/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({message: 'Invalid id'});
    }
    const r = await Driver.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({message: 'Driver not found'});
    await DriverPost.deleteMany({driverId: req.params.id});
    res.json({message: 'Driver deleted', success: true});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
});

/** Riders */
router.post('/riders', async (req, res) => {
  try {
    const doc = new Rider(req.body);
    await doc.save();
    res.status(201).json({
      _id: doc._id.toString(),
      message: 'Rider created successfully',
    });
  } catch (e) {
    res.status(400).json({message: e.message || 'Invalid rider data'});
  }
});

router.get('/riders/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({message: 'Invalid id'});
    }
    const doc = await Rider.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({message: 'Rider not found'});
    res.json(doc);
  } catch (e) {
    res.status(500).json({message: e.message});
  }
});

router.delete('/riders/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({message: 'Invalid id'});
    }
    const r = await Rider.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({message: 'Rider not found'});
    await RiderPost.deleteMany({riderId: req.params.id});
    res.json({message: 'Rider deleted', success: true});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
});

/** Driver posts */
router.post('/driverpost', async (req, res) => {
  try {
    const doc = new DriverPost(req.body);
    await doc.save();
    res.status(201).json({message: 'Ride post created successfully', post: doc});
  } catch (e) {
    res.status(400).json({error: e.message, message: e.message});
  }
});

router.get('/driverpost', async (req, res) => {
  try {
    const {pickup, dropoff} = req.query;
    let q = DriverPost.find();
    const items = await q.lean();
    const filtered = items.filter(p => {
      if (!pickup && !dropoff) return true;
      const pu = (p.pickup || '').toLowerCase();
      const du = (p.dropoff || '').toLowerCase();
      const wantPu = (pickup || '').trim().toLowerCase();
      const wantDo = (dropoff || '').trim().toLowerCase();
      const matchPu = wantPu ? pu.includes(wantPu) : true;
      const matchDo = wantDo ? du.includes(wantDo) : true;
      return matchPu && matchDo;
    });
    res.json({posts: filtered});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
});

router.get('/driverpost/:driverId', async (req, res) => {
  try {
    const {driverId} = req.params;
    const {booked} = req.query;
    const filter = {driverId: String(driverId)};
    if (booked === 'true' || booked === 'false') {
      filter.booked = booked === 'true';
    }
    const posts = await DriverPost.find(filter).lean();
    res.json({posts});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
});

/** Rider posts */
router.post('/riderpost', async (req, res) => {
  try {
    const doc = new RiderPost(req.body);
    await doc.save();
    res.status(201).json({message: 'Rider post created', ride: doc});
  } catch (e) {
    res.status(400).json({message: e.message || 'Invalid payload'});
  }
});

const listRiderPostsAll = async (req, res) => {
  try {
    const rides = await RiderPost.find().lean();
    res.json({rides});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
};

router.get('/riderpost', listRiderPostsAll);
router.get('/riderpost/', listRiderPostsAll);

router.get('/riderpost/:riderId', async (req, res) => {
  try {
    const {riderId} = req.params;
    const {booked} = req.query;
    const filter = {riderId: String(riderId)};
    if (booked === 'true' || booked === 'false') {
      filter.booked = booked === 'true';
    }
    const rides = await RiderPost.find(filter).lean();
    res.json({rides});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
});

router.delete('/riderpost/delete/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({message: 'Invalid id', success: false});
    }
    const r = await RiderPost.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({message: 'Not found', success: false});
    res.json({message: 'Ride removed', success: true});
  } catch (e) {
    res.status(500).json({message: e.message, success: false});
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({message: 'Invalid id', success: false});
    }
    const r = await DriverPost.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({message: 'Not found', success: false});
    res.json({message: 'Ride removed', success: true});
  } catch (e) {
    res.status(500).json({message: e.message, success: false});
  }
});

/** Book rider offer (driver post) – rider side */
router.patch('/rides/:id/book', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({message: 'Invalid id'});
    }
    const {
      driverId,
      driverName,
      driverNumber,
      driverVechileNumber,
      driverVechileColor,
      driverVechileModel,
    } = req.body;
    const update = {
      booked: true,
      driverId: driverId != null ? String(driverId) : null,
      driverName: driverName || null,
      driverNumber: driverNumber != null ? String(driverNumber) : null,
      driverVechileNumber: driverVechileNumber != null ? String(driverVechileNumber) : null,
      driverVechileColor: driverVechileColor != null ? String(driverVechileColor) : null,
      driverVechileModel: driverVechileModel != null ? String(driverVechileModel) : null,
    };
    const doc = await RiderPost.findByIdAndUpdate(
      req.params.id,
      {$set: update},
      {new: true}
    );
    if (!doc) return res.status(404).json({message: 'Ride not found'});
    res.json({message: 'Booked', ride: doc});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
});

/** Book driver offer (rider post) – SearchRide: PATCH /api/:id/book */
router.patch('/:id/book', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({message: 'Invalid id'});
    }
    const {riderId, riderName} = req.body;
    const update = {
      booked: true,
      riderId: riderId != null ? String(riderId) : null,
      riderName: riderName || null,
    };
    const doc = await DriverPost.findByIdAndUpdate(
      req.params.id,
      {$set: update},
      {new: true}
    );
    if (!doc) return res.status(404).json({message: 'Post not found'});
    res.json({message: 'Booked', post: doc});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
});

module.exports = router;
module.exports.fuelHandler = fuelHandler;
