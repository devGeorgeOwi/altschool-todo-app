const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { requireAuth } = require('../middleware/auth');

// Apply auth middleware to all task routes
router.use(requireAuth);

// ==================== DASHBOARD ====================
router.get('/dashboard', async (req, res) => {
  try {
    const { filter = 'all' } = req.query;

    // Build query
    let query = { user: req.session.userId };

    if (filter === 'pending') {
      query.status = 'pending';
    } else if (filter === 'completed') {
      query.status = 'completed';
    } else if (filter === 'deleted') {
      query.status = 'deleted';
    } else {
      // 'all' shows pending and completed (not deleted)
      query.status = { $in: ['pending', 'completed'] };
    }

    // Fetch tasks
    const tasks = await Task.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .lean();

    // Count stats
    const totalTasks = await Task.countDocuments({
      user: req.session.userId,
      status: { $in: ['pending', 'completed'] }
    });
    const pendingCount = await Task.countDocuments({
      user: req.session.userId,
      status: 'pending'
    });
    const completedCount = await Task.countDocuments({
      user: req.session.userId,
      status: 'completed'
    });

    res.render('dashboard', {
      title: 'Dashboard - Todo App',
      username: req.session.username,
      tasks,
      filter,
      stats: {
        total: totalTasks,
        pending: pendingCount,
        completed: completedCount
      },
      success: req.session.success || null,
      error: req.session.error || null
    });

    // Clear flash messages after rendering
    delete req.session.success;
    delete req.session.error;

  } catch (error) {
    console.error('❌ Dashboard error:', error);
    req.session.error = 'Failed to load dashboard. Please try again.';
    // Redirect to login instead of dashboard to avoid loop
    res.redirect('/login');
  }
});

// ==================== CREATE TASK ====================
router.post('/tasks', async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    if (!title || title.trim() === '') {
      req.session.error = 'Task title is required';
      return res.redirect('/dashboard');
    }

    const task = new Task({
      title: title.trim(),
      description: (description || '').trim(),
      priority: priority || 'medium',
      user: req.session.userId
    });

    await task.save();

    console.log(`✅ Task created: "${title}" for user ${req.session.username}`);
    req.session.success = 'Task created successfully!';
    res.redirect('/dashboard');

  } catch (error) {
    console.error('❌ Task creation error:', error);
    req.session.error = 'Failed to create task';
    res.redirect('/dashboard');
  }
});

// ==================== UPDATE TASK STATUS (AJAX) ====================
router.post('/tasks/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed', 'deleted'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.session.userId },
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    console.log(`✅ Task ${id} status updated to ${status}`);
    res.json({
      success: true,
      task: {
        _id: task._id,
        title: task.title,
        status: task.status,
        priority: task.priority
      }
    });

  } catch (error) {
    console.error('❌ Status update error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// ==================== PERMANENT DELETE (from trash) ====================
router.post('/tasks/:id/delete', async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({
      _id: id,
      user: req.session.userId,
      status: 'deleted' // Only allow permanent delete if already soft-deleted
    });

    if (!task) {
      req.session.error = 'Task not found or cannot be deleted';
      return res.redirect('/dashboard?filter=deleted');
    }

    console.log(`🗑️ Task permanently deleted: "${task.title}"`);
    req.session.success = 'Task permanently deleted';
    res.redirect('/dashboard?filter=deleted');

  } catch (error) {
    console.error('❌ Delete error:', error);
    req.session.error = 'Failed to delete task';
    res.redirect('/dashboard');
  }
});

// ==================== EDIT TASK (render form) ====================
router.get('/tasks/:id/edit', async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({
      _id: id,
      user: req.session.userId,
      status: { $in: ['pending', 'completed'] }
    }).lean();

    if (!task) {
      req.session.error = 'Task not found';
      return res.redirect('/dashboard');
    }

    res.render('edit-task', {
      title: 'Edit Task - Todo App',
      task,
      username: req.session.username,
      error: req.session.error,
      success: req.session.success
    });

    // Clear flash messages after rendering
    delete req.session.error;
    delete req.session.success;

  } catch (error) {
    console.error('❌ Edit task load error:', error);
    req.session.error = 'Failed to load task';
    res.redirect('/dashboard');
  }
});

// ==================== UPDATE TASK (submit edit) ====================
router.post('/tasks/:id/edit', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status } = req.body;

    // Validation
    if (!title || title.trim() === '') {
      req.session.error = 'Task title is required';
      return res.redirect(`/tasks/${id}/edit`);
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.session.userId },
      {
        title: title.trim(),
        description: (description || '').trim(),
        priority,
        status
      },
      { new: true }
    );

    if (!task) {
      req.session.error = 'Task not found';
      return res.redirect('/dashboard');
    }

    console.log(`✏️ Task updated: "${task.title}"`);
    req.session.success = 'Task updated successfully!';
    res.redirect('/dashboard');

  } catch (error) {
    console.error('❌ Edit task update error:', error);
    req.session.error = 'Failed to update task';
    res.redirect('/dashboard');
  }
});

module.exports = router;