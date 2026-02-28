const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Owner = require('../models/Owner');
const { authenticateToken } = require('../middleware/auth');

// Validation middleware for owner registration
const validateOwner = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.zipCode').notEmpty().withMessage('ZIP code is required'),
  body('address.country').notEmpty().withMessage('Country is required'),
  body('relationshipToPatient').notEmpty().withMessage('Relationship to patient is required'),
];

// @desc    Register a new owner
// @route   POST /api/owners/register
// @access  Public
router.post('/register', validateOwner, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if owner with this email already exists
    const existingOwner = await Owner.findOne({ email: req.body.email });
    if (existingOwner) {
      return res.status(400).json({
        message: 'Owner with this email already exists'
      });
    }

    // Create new owner
    const owner = new Owner(req.body);
    const savedOwner = await owner.save();

    res.status(201).json({
      message: 'Owner registered successfully',
      owner: savedOwner
    });
  } catch (error) {
    console.error('Error registering owner:', error);
    res.status(500).json({
      message: 'Error registering owner',
      error: error.message
    });
  }
});

// @desc    Get all owners
// @route   GET /api/owners
// @access  Private (needs authentication)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const owners = await Owner.find();
    res.json(owners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get owner by ID
// @route   GET /api/owners/:id
// @access  Private (needs authentication)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id);
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }
    res.json(owner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update owner
// @route   PUT /api/owners/:id
// @access  Private (needs authentication)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const owner = await Owner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }
    res.json({
      message: 'Owner updated successfully',
      owner
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete owner
// @route   DELETE /api/owners/:id
// @access  Private (needs authentication)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const owner = await Owner.findByIdAndDelete(req.params.id);
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }
    res.json({ message: 'Owner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;