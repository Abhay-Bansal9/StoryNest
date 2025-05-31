const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 120
  },
  content: { 
    type: String, 
    required: true,
    trim: true
  },
  tags: [{ 
    type: String, 
    trim: true 
  }],
  status: { 
    type: String, 
    enum: ['draft', 'published'], 
    default: 'draft' 
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  },
  updated_at: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Update the updated_at field before saving
blogSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('Blog', blogSchema);