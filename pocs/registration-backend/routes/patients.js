const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Patient = require('../models/Patient');
const { authenticateToken } = require('../middleware/auth');

// Validation middleware for patient registration
const validatePatient = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('dateOfBirth').notEmpty().withMessage('Date of birth is required'),
  body('gender').notEmpty().withMessage('Gender is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.zipCode').notEmpty().withMessage('ZIP code is required'),
  body('address.country').notEmpty().withMessage('Country is required'),
];

// @desc    Register a new patient
// @route   POST /api/patients/register
// @access  Public
router.post('/register', validatePatient, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if patient with this email already exists
    const existingPatient = await Patient.findOne({ email: req.body.email });
    if (existingPatient) {
      return res.status(400).json({
        message: 'Patient with this email already exists'
      });
    }

    // Create new patient
    const patient = new Patient(req.body);
    const savedPatient = await patient.save();

    res.status(201).json({
      message: 'Patient registered successfully',
      patient: savedPatient
    });
  } catch (error) {
    console.error('Error registering patient:', error);
    res.status(500).json({
      message: 'Error registering patient',
      error: error.message
    });
  }
});

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private (needs authentication)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private (needs authentication)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private (needs authentication)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json({
      message: 'Patient updated successfully',
      patient
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private (needs authentication)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;