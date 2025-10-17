const Rating = require('../models/Rating');
const Delivery = require('../models/Delivery');
const User = require('../models/User');

// Create a new rating
const createRating = async (req, res) => {
  try {
    const { delivery_id, rating, feedback } = req.body;
    const customer_id = req.user.id;

    // Validate input
    if (!delivery_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Delivery ID and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if delivery exists and belongs to the customer
    const delivery = await Delivery.findById(delivery_id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    if (delivery.customer_id !== customer_id) {
      return res.status(403).json({
        success: false,
        message: 'You can only rate your own deliveries'
      });
    }

    // Check if delivery is completed
    if (delivery.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'You can only rate completed deliveries'
      });
    }

    // Check if customer has already rated this delivery
    const existingRating = await Rating.hasCustomerRatedDelivery(customer_id, delivery_id);
    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this delivery'
      });
    }

    // Create rating
    const ratingId = await Rating.create({
      delivery_id,
      customer_id,
      driver_id: delivery.driver_id,
      rating,
      feedback: feedback || null
    });

    const newRating = await Rating.findById(ratingId);

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: newRating
    });

  } catch (error) {
    console.error('Error creating rating:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get rating by ID
const getRating = async (req, res) => {
  try {
    const { id } = req.params;

    const rating = await Rating.findById(id);
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    // Check if user can view this rating (customer who gave it, driver who received it, or admin)
    if (req.user.role !== 'admin' &&
        rating.customer_id !== req.user.id &&
        rating.driver_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: rating
    });

  } catch (error) {
    console.error('Error fetching rating:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get rating for a specific delivery
const getDeliveryRating = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    const rating = await Rating.findByDeliveryId(deliveryId);
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'No rating found for this delivery'
      });
    }

    // Check if user can view this rating
    if (req.user.role !== 'admin' &&
        rating.customer_id !== req.user.id &&
        rating.driver_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: rating
    });

  } catch (error) {
    console.error('Error fetching delivery rating:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all ratings for a driver
const getDriverRatings = async (req, res) => {
  try {
    const { driverId } = req.params;

    // Check if user can view driver ratings (driver themselves, admin, or customer who has deliveries with this driver)
    if (req.user.role !== 'admin' && req.user.id !== parseInt(driverId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const ratings = await Rating.findByDriverId(driverId);
    const stats = await Rating.getDriverAverageRating(driverId);

    res.json({
      success: true,
      data: {
        ratings,
        stats
      }
    });

  } catch (error) {
    console.error('Error fetching driver ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all ratings by a customer
const getCustomerRatings = async (req, res) => {
  try {
    const customerId = req.user.role === 'admin' ? req.params.customerId : req.user.id;

    const ratings = await Rating.findByCustomerId(customerId);

    res.json({
      success: true,
      data: ratings
    });

  } catch (error) {
    console.error('Error fetching customer ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all ratings (admin only)
const getAllRatings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const ratings = await Rating.findAll(parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: ratings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update rating
const updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    // Validate input
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Get existing rating
    const existingRating = await Rating.findById(id);
    if (!existingRating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    // Check if user can update this rating (only the customer who created it)
    if (existingRating.customer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own ratings'
      });
    }

    // Update rating
    const updated = await Rating.update(id, { rating, feedback });

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update rating'
      });
    }

    const updatedRating = await Rating.findById(id);

    res.json({
      success: true,
      message: 'Rating updated successfully',
      data: updatedRating
    });

  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete rating (admin only)
const deleteRating = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Rating.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    res.json({
      success: true,
      message: 'Rating deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createRating,
  getRating,
  getDeliveryRating,
  getDriverRatings,
  getCustomerRatings,
  getAllRatings,
  updateRating,
  deleteRating
};
