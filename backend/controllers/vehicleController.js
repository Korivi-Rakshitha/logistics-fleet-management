const Vehicle = require('../models/Vehicle');

const createVehicle = async (req, res) => {
  try {
    const { vehicle_number, vehicle_type, capacity, status } = req.body;

    // Check if vehicle already exists
    const existing = await Vehicle.findByNumber(vehicle_number);
    if (existing) {
      return res.status(400).json({ error: 'Vehicle number already exists' });
    }

    const vehicleId = await Vehicle.create({
      vehicle_number,
      vehicle_type,
      capacity,
      status
    });

    const vehicle = await Vehicle.findById(vehicleId);
    res.status(201).json({
      message: 'Vehicle created successfully',
      vehicle
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
};

const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.getAll();
    res.json({ vehicles });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
};

const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json({ vehicle });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const { vehicle_number, vehicle_type, capacity, status } = req.body;
    const updates = {};

    if (vehicle_number) updates.vehicle_number = vehicle_number;
    if (vehicle_type) updates.vehicle_type = vehicle_type;
    if (capacity !== undefined) updates.capacity = capacity;
    if (status) updates.status = status;

    const success = await Vehicle.update(req.params.id, updates);
    if (!success) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const vehicle = await Vehicle.findById(req.params.id);
    res.json({
      message: 'Vehicle updated successfully',
      vehicle
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const success = await Vehicle.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
};

const getAvailableVehicles = async (req, res) => {
  try {
    const { start_time, end_time } = req.query;

    if (!start_time || !end_time) {
      const vehicles = await Vehicle.getByStatus('available');
      return res.json({ vehicles });
    }

    const vehicles = await Vehicle.getAvailableForTimeSlot(start_time, end_time);
    res.json({ vehicles });
  } catch (error) {
    console.error('Get available vehicles error:', error);
    res.status(500).json({ error: 'Failed to fetch available vehicles' });
  }
};

const getVehicleUtilization = async (req, res) => {
  try {
    const stats = await Vehicle.getUtilizationStats();
    res.json({ utilization: stats });
  } catch (error) {
    console.error('Get vehicle utilization error:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle utilization' });
  }
};

module.exports = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getAvailableVehicles,
  getVehicleUtilization
};
