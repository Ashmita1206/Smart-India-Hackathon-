const express = require('express');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get student dashboard data
router.get('/dashboard', authorize('student'), async (req, res) => {
  try {
    const studentId = req.user.studentId;

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
        .reduce((sum, a) => sum + a.credits, 0)
    };

    // Get recent activities (last 5)
    const recentActivities = activities.slice(0, 5);

    // Get activity type distribution
    const activityTypes = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {});

    // Get monthly progress data (last 6 months)
    const monthlyData = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
      
      const monthActivities = activities.filter(activity => {
        const activityDate = new Date(activity.submittedAt);
        return activityDate.getFullYear() === monthDate.getFullYear() &&
               activityDate.getMonth() === monthDate.getMonth();
      });

      monthlyData.push({
        month: monthName,
        activities: monthActivities.length,
        verified: monthActivities.filter(a => a.status === 'verified').length,
        credits: monthActivities
          .filter(a => a.status === 'verified')
          .reduce((sum, a) => sum + a.credits, 0)
      });
    }

    res.json({
      stats,
      recentActivities,
      activityTypes,
      monthlyData
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student profile
router.get('/profile', authorize('student'), async (req, res) => {
  try {
    const student = await User.findById(req.userId).select('-password');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get additional stats
    const totalActivities = await Activity.countDocuments({ studentId: student.studentId });
    const verifiedActivities = await Activity.countDocuments({ 
      studentId: student.studentId, 
      status: 'verified' 
    });
    const totalCredits = await Activity.aggregate([
      { $match: { studentId: student.studentId, status: 'verified' } },
      { $group: { _id: null, total: { $sum: '$credits' } } }
    ]);

    const profile = {
      ...student.toObject(),
      stats: {
        totalActivities,
        verifiedActivities,
        totalCredits: totalCredits[0]?.total || 0
      }
    };

    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student profile
router.put('/profile', authorize('student'), async (req, res) => {
  try {
    const { name, year, gpa, preferences } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (year) updateData.year = year;
    if (gpa !== undefined) updateData.gpa = gpa;
    if (preferences) updateData.preferences = preferences;

    const student = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      student
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// Get student's activities with filters
router.get('/activities', authorize('student'), async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10, sortBy = 'submittedAt', sortOrder = 'desc' } = req.query;

    const query = { studentId: req.user.studentId };
    if (status) query.status = status;
    if (type) query.type = type;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const activities = await Activity.find(query)
      .populate('verifiedBy', 'name')
      .populate('rejectedBy', 'name')
      .sort(sortOptions)
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

// Get student's portfolio data
router.get('/portfolio', authorize('student'), async (req, res) => {
  try {
    const student = await User.findById(req.userId).select('-password');
    
    // Get all verified activities
    const activities = await Activity.find({ 
      studentId: student.studentId, 
      status: 'verified' 
    }).sort({ date: -1 });

    // Get achievements (verified activities with high credits or special types)
    const achievements = activities.filter(activity => 
      activity.credits >= 3 || 
      activity.type === 'research' || 
      activity.type === 'competition'
    ).map(activity => ({
      id: activity._id,
      title: activity.title,
      description: activity.description,
      date: activity.date,
      type: activity.type,
      verified: true
    }));

    // Calculate skills based on activity types
    const skills = {
      technical: [],
      soft: []
    };

    activities.forEach(activity => {
      switch (activity.type) {
        case 'certification':
          skills.technical.push('Certified Professional');
          break;
        case 'research':
          skills.technical.push('Research & Analysis');
          break;
        case 'conference':
          skills.soft.push('Public Speaking');
          skills.soft.push('Networking');
          break;
        case 'volunteering':
          skills.soft.push('Community Service');
          skills.soft.push('Leadership');
          break;
        case 'competition':
          skills.soft.push('Competitive Spirit');
          skills.soft.push('Problem Solving');
          break;
        case 'internship':
          skills.technical.push('Professional Experience');
          skills.soft.push('Teamwork');
          break;
      }
    });

    // Remove duplicates
    skills.technical = [...new Set(skills.technical)];
    skills.soft = [...new Set(skills.soft)];

    const portfolio = {
      personalInfo: {
        name: student.name,
        email: student.email,
        department: student.department,
        year: student.year,
        gpa: student.gpa,
        studentId: student.studentId
      },
      academicInfo: {
        degree: `Bachelor of Science in ${student.department}`,
        university: 'University of Technology',
        gpa: student.gpa,
        graduationYear: '2024',
        major: student.department
      },
      activities: activities.map(activity => ({
        id: activity._id,
        title: activity.title,
        type: activity.type,
        organization: activity.organization,
        date: activity.date,
        credits: activity.credits,
        description: activity.description,
        verified: true
      })),
      achievements,
      skills
    };

    res.json({ portfolio });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's progress over time
router.get('/progress', authorize('student'), async (req, res) => {
  try {
    const { timeframe = '6months' } = req.query;
    
    let monthsBack = 6;
    if (timeframe === '1year') monthsBack = 12;
    else if (timeframe === '2years') monthsBack = 24;

    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthsBack, 1);

    const activities = await Activity.find({
      studentId: req.user.studentId,
      submittedAt: { $gte: startDate }
    }).sort({ submittedAt: 1 });

    // Group by month
    const monthlyData = [];
    const monthlyMap = new Map();

    for (let i = 0; i < monthsBack; i++) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (monthsBack - 1 - i), 1);
      const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
      
      monthlyMap.set(monthKey, {
        month: monthName,
        activities: 0,
        verified: 0,
        credits: 0
      });
    }

    // Populate with actual data
    activities.forEach(activity => {
      const activityDate = new Date(activity.submittedAt);
      const monthKey = `${activityDate.getFullYear()}-${activityDate.getMonth()}`;
      
      if (monthlyMap.has(monthKey)) {
        const monthData = monthlyMap.get(monthKey);
        monthData.activities++;
        
        if (activity.status === 'verified') {
          monthData.verified++;
          monthData.credits += activity.credits;
        }
      }
    });

    monthlyData.push(...monthlyMap.values());

    res.json({ monthlyData });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's activity statistics
router.get('/stats', authorize('student'), async (req, res) => {
  try {
    const studentId = req.user.studentId;

    const [
      totalActivities,
      verifiedActivities,
      pendingActivities,
      rejectedActivities,
      totalCredits,
      activityTypeStats
    ] = await Promise.all([
      Activity.countDocuments({ studentId }),
      Activity.countDocuments({ studentId, status: 'verified' }),
      Activity.countDocuments({ studentId, status: 'pending' }),
      Activity.countDocuments({ studentId, status: 'rejected' }),
      Activity.aggregate([
        { $match: { studentId, status: 'verified' } },
        { $group: { _id: null, total: { $sum: '$credits' } } }
      ]),
      Activity.aggregate([
        { $match: { studentId } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ])
    ]);

    const stats = {
      totalActivities,
      verifiedActivities,
      pendingActivities,
      rejectedActivities,
      totalCredits: totalCredits[0]?.total || 0,
      verificationRate: totalActivities > 0 ? (verifiedActivities / totalActivities * 100).toFixed(1) : 0,
      activityTypes: activityTypeStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
