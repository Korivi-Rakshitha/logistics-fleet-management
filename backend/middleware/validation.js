const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    
    next();
  };
};

const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'driver', 'customer').required(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    address: Joi.string().max(500).optional(),
    pan_card: Joi.string().length(10).uppercase().optional(),
    aadhaar_card: Joi.string().pattern(/^[0-9]{12}$/).optional(),
    driving_license: Joi.string().min(8).max(16).uppercase().optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  vehicle: Joi.object({
    vehicle_number: Joi.string().required(),
    vehicle_type: Joi.string().required(),
    capacity: Joi.alternatives().try(
      Joi.number().positive(),
      Joi.string().pattern(/^[0-9]+$/).custom((value) => parseInt(value))
    ).required(),
    status: Joi.string().valid('available', 'in_use', 'maintenance').optional()
  }),

  delivery: Joi.object({
    customer_id: Joi.number().integer().positive().required(),
    driver_id: Joi.number().integer().positive().optional().allow(null),
    vehicle_id: Joi.number().integer().positive().optional().allow(null),
    route_id: Joi.number().integer().positive().optional().allow(null),
    pickup_location: Joi.string().required(),
    pickup_lat: Joi.alternatives().try(
      Joi.number().min(-90).max(90),
      Joi.string().pattern(/^-?[0-9]+(\.[0-9]+)?$/).custom((value) => parseFloat(value))
    ).required(),
    pickup_lng: Joi.alternatives().try(
      Joi.number().min(-180).max(180),
      Joi.string().pattern(/^-?[0-9]+(\.[0-9]+)?$/).custom((value) => parseFloat(value))
    ).required(),
    drop_location: Joi.string().required(),
    drop_lat: Joi.alternatives().try(
      Joi.number().min(-90).max(90),
      Joi.string().pattern(/^-?[0-9]+(\.[0-9]+)?$/).custom((value) => parseFloat(value))
    ).required(),
    drop_lng: Joi.alternatives().try(
      Joi.number().min(-180).max(180),
      Joi.string().pattern(/^-?[0-9]+(\.[0-9]+)?$/).custom((value) => parseFloat(value))
    ).required(),
    scheduled_pickup_time: Joi.alternatives().try(
      Joi.date().iso(),
      Joi.string().allow('', null)
    ).optional(),
    scheduled_delivery_time: Joi.alternatives().try(
      Joi.date().iso(),
      Joi.string().allow('', null)
    ).optional(),
    package_details: Joi.string().allow('').optional(),
    priority: Joi.string().valid('low', 'medium', 'high').optional(),
    requested_vehicle_type: Joi.string().optional()
  }),

  deliveryStatus: Joi.object({
    status: Joi.string().valid('pending', 'assigned', 'on_route', 'picked_up', 'delivered', 'cancelled').required()
  }),

  tracking: Joi.object({
    delivery_id: Joi.number().integer().positive().required(),
    current_lat: Joi.number().min(-90).max(90).required(),
    current_lng: Joi.number().min(-180).max(180).required(),
    speed: Joi.number().min(0).optional(),
    heading: Joi.number().min(0).max(360).optional()
  }),

  route: Joi.object({
    name: Joi.string().required(),
    start_location: Joi.string().required(),
    end_location: Joi.string().required(),
    start_lat: Joi.number().min(-90).max(90).required(),
    start_lng: Joi.number().min(-180).max(180).required(),
    end_lat: Joi.number().min(-90).max(90).required(),
    end_lng: Joi.number().min(-180).max(180).required(),
    distance: Joi.number().positive().optional(),
    estimated_duration: Joi.number().positive().optional()
  })
};

module.exports = { validate, schemas };
