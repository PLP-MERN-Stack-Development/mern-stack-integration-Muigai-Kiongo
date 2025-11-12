const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const Category = require('../models/Category');

// validation helper
const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
};

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/categories
router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Name is required')],
  async (req, res) => {
    if (handleValidation(req, res)) return;

    try {
      const { name } = req.body;
      // create slug
      const slug = name.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
      const existing = await Category.findOne({ $or: [{ slug }, { name: { $regex: new RegExp(`^${name}$`, 'i') } }] });
      if (existing) {
        return res.status(400).json({ error: 'Category already exists', details: existing });
      }
      const cat = new Category({ name, slug });
      const saved = await cat.save();
      res.status(201).json(saved);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: 'Failed to create category', details: err.message });
    }
  }
);

module.exports = router;