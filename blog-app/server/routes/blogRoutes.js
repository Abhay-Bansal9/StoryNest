const router = require('express').Router();
const Blog = require('../models/Blog');

// Save draft endpoint
router.post('/save-draft', async (req, res) => {
  try {
    const { id, title, content, tags } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    if (title.length > 120) {
      return res.status(400).json({ error: 'Title must be under 120 characters' });
    }

    const update = { 
      title, 
      content, 
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      updated_at: new Date() 
    };
    
    const blog = id 
      ? await Blog.findByIdAndUpdate(id, update, { new: true })
      : await Blog.create({ ...update, status: 'draft' });
      
    res.json(blog);
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

// Publish endpoint
router.post('/publish', async (req, res) => {
  try {
    const { id, title, content, tags } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    if (title.length > 120) {
      return res.status(400).json({ error: 'Title must be under 120 characters' });
    }

    const update = { 
      title, 
      content, 
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      status: 'published',
      updated_at: new Date() 
    };
    
    const blog = await Blog.findByIdAndUpdate(id, update, { new: true });
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (error) {
    console.error('Error publishing blog:', error);
    res.status(500).json({ error: 'Failed to publish blog' });
  }
});

// Get all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ updated_at: -1 })
      .select('title content tags status created_at updated_at');
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// Get blog by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

module.exports = router;