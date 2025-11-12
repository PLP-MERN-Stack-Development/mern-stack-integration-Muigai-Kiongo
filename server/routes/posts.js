const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const router = express.Router();

const Post = require('../models/Post');
let Category = null;
try {
  Category = require('../models/Category');
} catch (err) {
  Category = null;
}

/* validation helper */
const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
};

// Helper: create slug base from title
function slugify(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s-]+/g, '') // remove non-word chars except spaces/hyphens
    .trim()
    .replace(/\s+/g, '-'); // replace spaces with -
}

// Helper: make a slug unique in Post collection by appending a short suffix when necessary
async function makeUniqueSlug(base) {
  if (!base) base = 'post';
  let slug = base;
  // check existence
  let exists = await Post.findOne({ slug }).select('_id').lean();
  if (!exists) return slug;
  // append timestamp/random suffix until unique
  for (let i = 0; i < 6; i++) {
    const suffix = (Date.now().toString(36).slice(-6) + Math.random().toString(36).slice(2, 5)).slice(0, 8);
    slug = `${base}-${suffix}`;
    exists = await Post.findOne({ slug }).select('_id').lean();
    if (!exists) return slug;
  }
  // fallback
  return `${base}-${Date.now()}`;
}

// Helper: resolve a category input (id, slug or name). Returns category id.
async function resolveCategory(categoryInput) {
  if (!Category) return null;
  if (!categoryInput) return null;

  // If it's a valid ObjectId, assume it's an id
  if (mongoose.Types.ObjectId.isValid(String(categoryInput))) {
    const exist = await Category.findById(String(categoryInput));
    if (exist) return exist._id;
    // If ObjectId provided but not found, fallthrough to try matching by slug/name
  }

  // Try find by slug
  const bySlug = await Category.findOne({ slug: String(categoryInput).toLowerCase() });
  if (bySlug) return bySlug._id;

  // Try find by exact name (case-insensitive)
  const byName = await Category.findOne({ name: { $regex: new RegExp(`^${String(categoryInput)}$`, 'i') } });
  if (byName) return byName._id;

  // If not found, create a new category using the provided input as name
  const name = String(categoryInput).trim();
  const slug = name.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  const newCat = new Category({ name, slug });
  await newCat.save();
  return newCat._id;
}

// GET /api/posts - list posts (with optional pagination & search)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, q } = req.query;
    const filter = q
      ? {
          $or: [
            { title: new RegExp(q, 'i') },
            { content: new RegExp(q, 'i') },
            { excerpt: new RegExp(q, 'i') },
          ],
        }
      : {};

    const postsQuery = Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    postsQuery.populate('author', 'name email').populate('category', 'name slug');

    const posts = await postsQuery.exec();
    const total = await Post.countDocuments(filter);

    res.json({ data: posts, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// GET /api/posts/:id - get single post by id or slug
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
    const post = await Post.findOne(query).populate('author', 'name email').populate('category', 'name slug');
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // increment viewCount (non-blocking)
    post.viewCount = (post.viewCount || 0) + 1;
    post.save().catch((e) => console.error('Failed to increment view count', e));

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// POST /api/posts - create a new post
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    // leave author/category validation to Mongoose or resolver
  ],
  async (req, res) => {
    if (handleValidation(req, res)) return;

    try {
      const payload = { ...req.body };

      // Resolve category: accept id, slug, or name string. If provided, convert to ObjectId.
      if (payload.category && Category) {
        payload.category = await resolveCategory(payload.category);
      }

      // ensure slug exists: prefer provided slug, else slugify title
      if (!payload.slug) {
        const base = slugify(payload.title || '');
        payload.slug = await makeUniqueSlug(base || 'post');
      } else {
        payload.slug = slugify(payload.slug) || (await makeUniqueSlug(slugify(payload.title || 'post')));
      }

      const post = new Post(payload);
      const saved = await post.save();

      // populate and return
      const populated = await Post.findById(saved._id).populate('author', 'name email').populate('category', 'name slug');
      res.status(201).json(populated);
    } catch (err) {
      console.error(err);
      if (err.code === 11000) {
        return res.status(400).json({ error: 'Duplicate value', details: err.keyValue });
      }
      res.status(400).json({ error: 'Failed to create post', details: err.message });
    }
  }
);

// PUT /api/posts/:id - update a post
router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('content').optional().notEmpty().withMessage('Content cannot be empty'),
  ],
  async (req, res) => {
    if (handleValidation(req, res)) return;

    try {
      const update = { ...req.body };

      if (update.category && Category) {
        update.category = await resolveCategory(update.category);
      }

      // If title changed or slug missing, regenerate slug (avoid collision)
      if (!update.slug && update.title) {
        const base = slugify(update.title || '');
        update.slug = await makeUniqueSlug(base || 'post');
      } else if (update.slug) {
        update.slug = slugify(update.slug) || (await makeUniqueSlug(slugify(update.title || 'post')));
      }

      const updated = await Post.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
        .populate('author', 'name email')
        .populate('category', 'name slug');

      if (!updated) return res.status(404).json({ error: 'Post not found' });
      res.json(updated);
    } catch (err) {
      console.error(err);
      if (err.code === 11000) {
        return res.status(400).json({ error: 'Duplicate value', details: err.keyValue });
      }
      res.status(400).json({ error: 'Failed to update post', details: err.message });
    }
  }
);

// DELETE /api/posts/:id - delete a post
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Post.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post deleted', id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;