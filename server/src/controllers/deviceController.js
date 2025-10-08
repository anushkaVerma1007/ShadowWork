const Device = require('../models/Device');

exports.getDevices = async (req, res) => {
  try {
    const devices = await Device.find();
    res.json({ success: true, devices });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
};

exports.getDeviceById = async (req, res) => {
  try {
    const device = await Device.findOne({ deviceId: req.params.deviceId });
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json({ success: true, device });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch device' });
  }
};