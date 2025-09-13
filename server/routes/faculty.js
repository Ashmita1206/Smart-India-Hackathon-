const express = require('express');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require faculty or admin role
router.use(auth);
router.use(authorize('faculty', 'admin'));

// Get pending activities
router.get('/pending', async (req, res) => {
  try {
    const { page = 1, limit = 10, type, department } = req.query;

    const query = { status: 'pending' };
    if (type) query.type = type;

    let activities = await Activity.find(query)
      .populate('student', 'name email department studentId')
      .sort({ submittedAt: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter by department if specified
    if (department) {
      activities = activities.filter(activity => 
        activity.student.department === department
      );
    }

    const total = await Activity.countDocuments(query);

    res.json({
      activities,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get pending activities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all activities with filters
router.get('/activities', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      type, 
      department, 
      studentId,
      startDate,
      endDate,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (studentId) query.studentId = studentId;
    
    if (startDate || endDate) {
      query.submittedAt = {};
      if (startDate) query.submittedAt.$gte = new Date(startDate);
      if (endDate) query.submittedAt.$lte = new Date(endDate);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    let activities = await Activity.find(query)
      .populate('student', 'name email department studentId')
      .populate('verifiedBy', 'name')
      .populate('rejectedBy', 'name')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter by department if specified
    if (department) {
      activities = activities.filter(activity => 
        activity.student.department === department
      );
    }

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

// Approve activity
router.put('/activities/:id/approve', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    if (activity.status !== 'pending') {
      return res.status(400).json({ message: 'Activity is not pending approval' });
    }

    await activity.updateStatus('verified', req.userId);

    await activity.populate('student', 'name email department');
    await activity.populate('verifiedBy', 'name');

    res.json({
      message: 'Activity approved successfully',
      activity
    });
  } catch (error) {
    console.error('Approve activity error:', error);
    res.status(500).json({ message: 'Server error during approval' });
  }
});

// Reject activity
router.put('/activities/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    if (activity.status !== 'pending') {
      return res.status(400).json({ message: 'Activity is not pending approval' });
    }

    await activity.updateStatus('rejected', req.userId, reason);

    await activity.populate('student', 'name email department');
    await activity.populate('rejectedBy', 'name');

    res.json({
      message: 'Activity rejected successfully',
      activity
    });
  } catch (error) {
    console.error('Reject activity error:', error);
    res.status(500).json({ message: 'Server error during rejection' });
  }
});

// Get students list
router.get('/students', async (req, res) => {
  try {
    const { page = 1, limit = 10, department, year, search } = req.query;

    const query = { role: 'student' };
    if (department) query.department = department;
    if (year) query.year = year;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await User.find(query)
      .select('-password')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    // Get activity counts for each student
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const totalActivities = await Activity.countDocuments({ studentId: student.studentId });
        const verifiedActivities = await Activity.countDocuments({ 
          studentId: student.studentId, 
          status: 'verified' 
        });
        const pendingActivities = await Activity.countDocuments({ 
          studentId: student.studentId, 
          status: 'pending' 
        });

        return {
          ...student.toObject(),
          stats: {
            totalActivities,
            verifiedActivities,
            pendingActivities
          }
        };
      })
    );

    res.json({
      students: studentsWithStats,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student details
router.get('/students/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findOne({ studentId, role: 'student' }).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get student's activities
    const activities = await Activity.find({ studentId })
      .populate('verifiedBy', 'name')
      .populate('rejectedBy', 'name')
      .sort({ submittedAt: -1 });

    // Calculate statistics
    const stats = {
      totalActivities: activities.length,
      verifiedActivities: activities.filter(a => a.status === 'verified').length,
      pendingActivities: activities.filter(a => a.status === 'pending').length,
      rejectedActivities: activities.filter(a => a.status === 'rejected').length,
      totalCredits: activities
        .filter(a => a.status === 'verified')
        .reduce((sum, a) => sum + a.credits, 0),
      averageCreditsPerActivity: 0
    };

    if (stats.verifiedActivities > 0) {
      stats.averageCreditsPerActivity = stats.totalCredits / stats.verifiedActivities;
    }

    res.json({
      student,
      activities,
      stats
    });
  } catch (error) {
    console.error('Get student details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk approve activities
router.put('/activities/bulk-approve', async (req, res) => {
  try {
    const { activityIds } = req.body;

    if (!Array.isArray(activityIds) || activityIds.length === 0) {
      return res.status(400).json({ message: 'Activity IDs array is required' });
    }

    const activities = await Activity.find({
      _id: { $in: activityIds },
      status: 'pending'
    });

    if (activities.length === 0) {
      return res.status(404).json({ message: 'No pending activities found' });
    }

    // Update all activities
    const updatePromises = activities.map(activity => 
      activity.updateStatus('verified', req.userId)
    );

    await Promise.all(updatePromises);

    res.json({
      message: `${activities.length} activities approved successfully`,
      approvedCount: activities.length
    });
  } catch (error) {
    console.error('Bulk approve error:', error);
    res.status(500).json({ message: 'Server error during bulk approval' });
  }
});

// Bulk reject activities
router.put('/activities/bulk-reject', async (req, res) => {
  try {
    const { activityIds, reason } = req.body;

    if (!Array.isArray(activityIds) || activityIds.length === 0) {
      return res.status(400).json({ message: 'Activity IDs array is required' });
    }

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const activities = await Activity.find({
      _id: { $in: activityIds },
      status: 'pending'
    });

    if (activities.length === 0) {
      return res.status(404).json({ message: 'No pending activities found' });
    }

    // Update all activities
    const updatePromises = activities.map(activity => 
      activity.updateStatus('rejected', req.userId, reason)
    );

    await Promise.all(updatePromises);

    res.json({
      message: `${activities.length} activities rejected successfully`,
      rejectedCount: activities.length
    });
  } catch (error) {
    console.error('Bulk reject error:', error);
    res.status(500).json({ message: 'Server error during bulk rejection' });
  }
});

// Get faculty dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const { department } = req.query;

    const baseQuery = {};
    if (department) {
      // Get students in department first
      const students = await User.find({ department, role: 'student' }).select('studentId');
      const studentIds = students.map(s => s.studentId);
      baseQuery.studentId = { $in: studentIds };
    }

    const [
      totalStudents,
      totalActivities,
      pendingActivities,
      verifiedActivities,
      rejectedActivities,
      totalCredits
    ] = await Promise.all([
      User.countDocuments(department ? { department, role: 'student' } : { role: 'student' }),
      Activity.countDocuments(baseQuery),
      Activity.countDocuments({ ...baseQuery, status: 'pending' }),
      Activity.countDocuments({ ...baseQuery, status: 'verified' }),
      Activity.countDocuments({ ...baseQuery, status: 'rejected' }),
      Activity.aggregate([
        { $match: { ...baseQuery, status: 'verified' } },
        { $group: { _id: null, total: { $sum: '$credits' } } }
      ])
    ]);

    const stats = {
      totalStudents,
      totalActivities,
      pendingActivities,
      verifiedActivities,
      rejectedActivities,
      totalCredits: totalCredits[0]?.total || 0,
      verificationRate: totalActivities > 0 ? (verifiedActivities / totalActivities * 100).toFixed(1) : 0
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
