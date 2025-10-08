const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const deviceController = require('../controllers/deviceController');

// Job routes
router.post('/jobs', jobController.submitJob);
router.get('/jobs', jobController.getJobs);
router.get('/jobs/:jobId', jobController.getJobById);

// Device routes
router.get('/devices', deviceController.getDevices);
router.get('/devices/:deviceId', deviceController.getDeviceById);

module.exports = router;