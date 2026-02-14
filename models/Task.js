const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'deleted'],
    default: 'pending'
  },
  priority: { 
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
taskSchema.index({ user: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);