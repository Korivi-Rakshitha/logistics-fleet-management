  const Delivery = require('../models/Delivery');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

const createDelivery = async (req, res) => {
  try {
    const {
      customer_id, driver_id, vehicle_id, route_id,
      pickup_location, pickup_lat, pickup_lng,
      drop_location, drop_lat, drop_lng,
      scheduled_pickup_time, scheduled_delivery_time,
      package_details, priority
    } = req.body;

    // Check for scheduling conflicts if driver and vehicle are assigned
    if (driver_id && vehicle_id) {
      const conflicts = await Delivery.checkConflicts(
        driver_id,
        vehicle_id,
        scheduled_pickup_time,
        scheduled_delivery_time
      );

      if (conflicts.length > 0) {
        return res.status(409).json({
          error: 'Scheduling conflict detected',
          message: 'Driver or vehicle is already assigned to another delivery during this time slot',
          conflicts
        });
      }

      // Update vehicle status
      await Vehicle.update(vehicle_id, { status: 'in_use' });
    }

    const deliveryId = await Delivery.create({
      customer_id, driver_id, vehicle_id, route_id,
      pickup_location, pickup_lat, pickup_lng,
      drop_location, drop_lat, drop_lng,
      scheduled_pickup_time, scheduled_delivery_time,
      package_details, priority
    });

    const delivery = await Delivery.findById(deliveryId);
    res.status(201).json({
      message: 'Delivery created successfully',
      delivery
    });
  } catch (error) {
    console.error('Create delivery error:', error);
    res.status(500).json({ error: 'Failed to create delivery' });
  }
};

const getAllDeliveries = async (req, res) => {
  try {
    const { status, customer_id, driver_id, priority } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (customer_id) filters.customer_id = customer_id;
    if (driver_id) filters.driver_id = driver_id;
    if (priority) filters.priority = priority;

    const deliveries = await Delivery.getAll(filters);
    res.json({ deliveries });
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
};

const getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }
    res.json({ delivery });
  } catch (error) {
    console.error('Get delivery error:', error);
    res.status(500).json({ error: 'Failed to fetch delivery' });
  }
};

const updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const deliveryId = req.params.id;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    // Status transition validation
    const validTransitions = {
      'pending': ['assigned', 'cancelled'],
      'assigned': ['on_route', 'cancelled'],
      'on_route': ['picked_up', 'cancelled'],
      'picked_up': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': []
    };

    if (!validTransitions[delivery.status].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status transition',
        message: `Cannot change status from ${delivery.status} to ${status}`
      });
    }

    await Delivery.updateStatus(deliveryId, status);

    // Update vehicle status when delivery is completed or cancelled
    if ((status === 'delivered' || status === 'cancelled') && delivery.vehicle_id) {
      await Vehicle.update(delivery.vehicle_id, { status: 'available' });
    }

    const updatedDelivery = await Delivery.findById(deliveryId);
    
    // Emit socket event for real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('delivery-status-updated', {
        deliveryId,
        status,
        delivery: updatedDelivery
      });
    }

    res.json({
      message: 'Delivery status updated successfully',
      delivery: updatedDelivery
    });
  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({ error: 'Failed to update delivery status' });
  }
};

const assignDriver = async (req, res) => {
  try {
    const { driver_id, vehicle_id } = req.body;
    const deliveryId = req.params.id;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    // Only check for conflicts if scheduled times are provided
    if (delivery.scheduled_pickup_time && delivery.scheduled_delivery_time) {
      const conflicts = await Delivery.checkConflicts(
        driver_id,
        vehicle_id,
        delivery.scheduled_pickup_time,
        delivery.scheduled_delivery_time,
        deliveryId
      );

      if (conflicts.length > 0) {
        return res.status(409).json({
          error: 'Scheduling conflict detected',
          message: 'Driver or vehicle is already assigned to another delivery during this time slot',
          conflicts
        });
      }
    }

    await Delivery.assignDriver(deliveryId, driver_id, vehicle_id);
    await Vehicle.update(vehicle_id, { status: 'in_use' });

    const updatedDelivery = await Delivery.findById(deliveryId);
    
    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').emit('driver-assigned', {
        deliveryId,
        driverId: driver_id,
        delivery: updatedDelivery
      });
    }

    res.json({
      message: 'Driver assigned successfully',
      delivery: updatedDelivery
    });
  } catch (error) {
    console.error('Assign driver error:', error);
    res.status(500).json({ error: 'Failed to assign driver' });
  }
};

const getMyDeliveries = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let deliveries;
    if (role === 'customer') {
      deliveries = await Delivery.getByCustomer(userId);
    } else if (role === 'driver') {
      deliveries = await Delivery.getByDriver(userId);
    } else {
      deliveries = await Delivery.getAll();
    }

    res.json({ deliveries });
  } catch (error) {
    console.error('Get my deliveries error:', error);
    res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
};

const getActiveDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.getActiveDeliveries();
    res.json({ deliveries });
  } catch (error) {
    console.error('Get active deliveries error:', error);
    res.status(500).json({ error: 'Failed to fetch active deliveries' });
  }
};

const getDeliveryStats = async (req, res) => {
  try {
    const { driver_id } = req.query;
    const stats = await Delivery.getDeliveryStats(driver_id);
    res.json({ stats });
  } catch (error) {
    console.error('Get delivery stats error:', error);
    res.status(500).json({ error: 'Failed to fetch delivery statistics' });
  }
};

const deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    // Only allow deletion of pending deliveries
    if (delivery.status !== 'pending') {
      return res.status(400).json({
        error: 'Cannot delete delivery',
        message: 'Only pending deliveries can be deleted'
      });
    }

    await Delivery.delete(req.params.id);
    res.json({ message: 'Delivery deleted successfully' });
  } catch (error) {
    console.error('Delete delivery error:', error);
    res.status(500).json({ error: 'Failed to delete delivery' });
  }
};

const cancelDelivery = async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    // Only allow cancellation of pending or assigned deliveries
    if (!['pending', 'assigned'].includes(delivery.status)) {
      return res.status(400).json({
        error: 'Cannot cancel delivery',
        message: 'Only pending or assigned deliveries can be cancelled'
      });
    }

    await Delivery.updateStatus(deliveryId, 'cancelled');

    // Update vehicle status to available if assigned
    if (delivery.vehicle_id) {
      await Vehicle.update(delivery.vehicle_id, { status: 'available' });
    }

    const updatedDelivery = await Delivery.findById(deliveryId);

    // Emit socket event for real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('delivery-status-updated', {
        deliveryId,
        status: 'cancelled',
        delivery: updatedDelivery
      });
    }

    res.json({
      message: 'Delivery cancelled successfully',
      delivery: updatedDelivery
    });
  } catch (error) {
    console.error('Cancel delivery error:', error);
    res.status(500).json({ error: 'Failed to cancel delivery' });
  }
};

module.exports = {
  createDelivery,
  getAllDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
  assignDriver,
  getMyDeliveries,
  getActiveDeliveries,
  getDeliveryStats,
  deleteDelivery,
  cancelDelivery
};
