const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Activity = require('../models/Activity');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/activities';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, and documents are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get all activities for a student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status, type, page = 1, limit = 10 } = req.query;

    // Check if user can access this student's data
    if (req.user.role === 'student' && req.user.studentId !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const query = { studentId };
    if (status) query.status = status;
    if (type) query.type = type;

    const activities = await Activity.find(query)
      .populate('student', 'name email department')
      .populate('verifiedBy', 'name')
      .populate('rejectedBy', 'name')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Activity.countDocuments(query);

    res.json({
      activities,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single activity
router.get('/:id', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('student', 'name email department studentId')
      .populate('verifiedBy', 'name')
      .populate('rejectedBy', 'name')
      .populate('comments.user', 'name');

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Check access permissions
    if (req.user.role === 'student' && activity.student._id.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ activity });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new activity
router.post('/', auth, upload.array('files', 5), async (req, res) => {
  try {
    const { title, description, type, organization, date, credits, tags } = req.body;

    // Prepare files data
    const files = req.files ? req.files.map(file => ({
      name: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimeType: file.mimetype
    })) : [];

    const activity = new Activity({
      title,
      description,
      type,
      organization,
      date: new Date(date),
      credits: parseInt(credits),
      student: req.userId,
      studentId: req.user.studentId,
      studentName: req.user.name,
      files,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    await activity.save();
    await activity.populate('student', 'name email department');

    res.status(201).json({
      message: 'Activity submitted successfully',
      activity
    });
  } catch (error) {
    console.error('Create activity error:', error);
    
    // Clean up uploaded files if activity creation fails
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({ message: 'Server error during activity creation' });
  }
});

// Update activity (only by owner)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, organization, date, credits, tags } = req.body;

    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Check if user owns this activity
    if (activity.student.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Can only update if status is pending
    if (activity.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot update verified or rejected activities' });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (organization) updateData.organization = organization;
    if (date) updateData.date = new Date(date);
    if (credits) updateData.credits = parseInt(credits);
    if (tags) updateData.tags = tags.split(',').map(tag => tag.trim());

    const updatedActivity = await Activity.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('student', 'name email department');

    res.json({
      message: 'Activity updated successfully',
      activity: updatedActivity
    });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ message: 'Server error during activity update' });
  }
});

// Delete activity (only by owner and if pending)
router.delete('/:id', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Check if user owns this activity
    if (activity.student.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Can only delete if status is pending
    if (activity.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot delete verified or rejected activities' });
    }

    // Delete associated files
    activity.files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    await Activity.findByIdAndDelete(req.params.id);

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ message: 'Server error during activity deletion' });
  }
});

// Add comment to activity
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;

    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Only faculty can add comments
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only faculty can add comments' });
    }

    activity.comments.push({
      user: req.userId,
      content
    });

    await activity.save();
    await activity.populate('comments.user', 'name');

    res.json({
      message: 'Comment added successfully',
      activity
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error during comment addition' });
  }
});

// Download file
router.get('/:id/files/:fileId', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Check access permissions
    if (req.user.role === 'student' && activity.student.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const file = activity.files.id(req.params.fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    res.download(file.path, file.originalName);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ message: 'Server error during file download' });
  }
});

module.exports = router;
