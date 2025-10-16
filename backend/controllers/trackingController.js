const Tracking = require('../models/Tracking');
const Delivery = require('../models/Delivery');
const Vehicle = require('../models/Vehicle');

const updateLocation = async (req, res) => {
  try {
    const { delivery_id, current_lat, current_lng, speed, heading } = req.body;

    // Verify delivery exists and is active
    const delivery = await Delivery.findById(delivery_id);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    if (!['on_route', 'picked_up'].includes(delivery.status)) {
      return res.status(400).json({
        error: 'Invalid delivery status',
        message: 'Can only track deliveries that are on route or picked up'
      });
    }

    // Create tracking record
    await Tracking.create({
      delivery_id,
      driver_id: delivery.driver_id,
      vehicle_id: delivery.vehicle_id,
      current_lat,
      current_lng,
      speed,
      heading
    });

    // Update vehicle location
    if (delivery.vehicle_id) {
      await Vehicle.updateLocation(delivery.vehicle_id, current_lat, current_lng);
    }

    // Emit real-time update via Socket.io
    if (req.app.get('io')) {
      req.app.get('io').emit('location-update', {
        delivery_id,
        current_lat,
        current_lng,
        speed,
        heading,
        timestamp: new Date()
      });

      // Emit to specific delivery room
      req.app.get('io').to(`delivery-${delivery_id}`).emit('tracking-update', {
        current_lat,
        current_lng,
        speed,
        heading,
        timestamp: new Date()
      });
    }

    res.json({
      message: 'Location updated successfully',
      location: { current_lat, current_lng, speed, heading }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};

const getDeliveryTracking = async (req, res) => {
  try {
    const deliveryId = req.params.id;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const latestTracking = await Tracking.getLatestByDelivery(deliveryId);
    const trackingHistory = await Tracking.getTrackingHistory(deliveryId, 100);

    res.json({
      delivery: {
        id: delivery.id,
        status: delivery.status,
        pickup_location: delivery.pickup_location,
        pickup_lat: delivery.pickup_lat,
        pickup_lng: delivery.pickup_lng,
        drop_location: delivery.drop_location,
        drop_lat: delivery.drop_lat,
        drop_lng: delivery.drop_lng,
        driver_name: delivery.driver_name,
        vehicle_number: delivery.vehicle_number
      },
      current_location: latestTracking || null,
      tracking_history: trackingHistory
    });
  } catch (error) {
    console.error('Get delivery tracking error:', error);
    res.status(500).json({ error: 'Failed to fetch tracking data' });
  }
};

const getRecentTracking = async (req, res) => {
  try {
    const { minutes = 5 } = req.query;
    const tracking = await Tracking.getRecentTracking(parseInt(minutes));
    res.json({ tracking });
  } catch (error) {
    console.error('Get recent tracking error:', error);
    res.status(500).json({ error: 'Failed to fetch recent tracking' });
  }
};

module.exports = {
  updateLocation,
  getDeliveryTracking,
  getRecentTracking
};
