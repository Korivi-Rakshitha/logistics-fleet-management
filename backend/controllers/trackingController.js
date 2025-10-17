const Tracking = require('../models/Tracking');
const Delivery = require('../models/Delivery');
const Vehicle = require('../models/Vehicle');
const db = require('../utils/db');

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

const getActiveDriversLocations = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        d.id as delivery_id,
        d.status as delivery_status,
        d.pickup_location,
        d.drop_location,
        d.pickup_lat,
        d.pickup_lng,
        d.drop_lat,
        d.drop_lng,
        u.id as driver_id,
        u.name as driver_name,
        u.phone as driver_phone,
        v.id as vehicle_id,
        v.vehicle_number,
        v.vehicle_type,
        v.current_location_lat,
        v.current_location_lng,
        t.current_lat,
        t.current_lng,
        t.speed,
        t.heading,
        t.timestamp as last_update
      FROM deliveries d
      LEFT JOIN users u ON d.driver_id = u.id
      LEFT JOIN vehicles v ON d.vehicle_id = v.id
      LEFT JOIN tracking t ON d.id = t.delivery_id
      WHERE d.status IN ('on_route', 'picked_up')
      AND d.driver_id IS NOT NULL
      AND t.id = (
        SELECT MAX(id) FROM tracking WHERE delivery_id = d.id
      )
      ORDER BY t.timestamp DESC
    `);

    // Group by driver to avoid duplicates
    const driversMap = new Map();
    rows.forEach(row => {
      if (!driversMap.has(row.driver_id)) {
        driversMap.set(row.driver_id, {
          driver_id: row.driver_id,
          driver_name: row.driver_name,
          driver_phone: row.driver_phone,
          current_lat: row.current_lat || row.current_location_lat,
          current_lng: row.current_lng || row.current_location_lng,
          speed: row.speed,
          heading: row.heading,
          last_update: row.last_update,
          vehicle: {
            id: row.vehicle_id,
            vehicle_number: row.vehicle_number,
            vehicle_type: row.vehicle_type
          },
          active_delivery: {
            id: row.delivery_id,
            status: row.delivery_status,
            pickup_location: row.pickup_location,
            drop_location: row.drop_location,
            pickup_lat: row.pickup_lat,
            pickup_lng: row.pickup_lng,
            drop_lat: row.drop_lat,
            drop_lng: row.drop_lng
          }
        });
      }
    });

    const activeDrivers = Array.from(driversMap.values());
    res.json({ activeDrivers });
  } catch (error) {
    console.error('Get active drivers locations error:', error);
    res.status(500).json({ error: 'Failed to fetch active drivers locations' });
  }
};

module.exports = {
  updateLocation,
  getDeliveryTracking,
  getRecentTracking,
  getActiveDriversLocations
};
