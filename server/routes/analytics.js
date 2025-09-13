const express = require('express');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require faculty or admin role
router.use(auth);
router.use(authorize('faculty', 'admin'));

// Get overview statistics
router.get('/overview', async (req, res) => {
  try {
    const { department, timeframe = '6months' } = req.query;

    // Calculate date range
    const currentDate = new Date();
    let startDate;
    
    switch (timeframe) {
      case '1month':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        break;
      case '3months':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
        break;
      case '6months':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1);
        break;
      case '1year':
        startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
        break;
      default:
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1);
    }

    // Build base query
    const baseQuery = { submittedAt: { $gte: startDate } };
    const userQuery = department ? { department, role: 'student' } : { role: 'student' };

    // Get students in department if specified
    let studentIds = [];
    if (department) {
      const students = await User.find(userQuery).select('studentId');
      studentIds = students.map(s => s.studentId);
      baseQuery.studentId = { $in: studentIds };
    }

    const [
      totalStudents,
      totalActivities,
      verifiedActivities,
      pendingActivities,
      rejectedActivities,
      totalCredits,
      averageGPA
    ] = await Promise.all([
      User.countDocuments(userQuery),
      Activity.countDocuments(baseQuery),
      Activity.countDocuments({ ...baseQuery, status: 'verified' }),
      Activity.countDocuments({ ...baseQuery, status: 'pending' }),
      Activity.countDocuments({ ...baseQuery, status: 'rejected' }),
      Activity.aggregate([
        { $match: { ...baseQuery, status: 'verified' } },
        { $group: { _id: null, total: { $sum: '$credits' } } }
      ]),
      User.aggregate([
        { $match: userQuery },
        { $group: { _id: null, avgGPA: { $avg: '$gpa' } } }
      ])
    ]);

    const completionRate = totalActivities > 0 ? (verifiedActivities / totalActivities * 100).toFixed(1) : 0;

    const overview = {
      totalStudents,
      totalActivities,
      verifiedActivities,
      pendingActivities,
      rejectedActivities,
      totalCredits: totalCredits[0]?.total || 0,
      averageGPA: averageGPA[0]?.avgGPA?.toFixed(1) || 0,
      completionRate: parseFloat(completionRate)
    };

    res.json({ overview });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get activity trends
router.get('/trends', async (req, res) => {
  try {
    const { timeframe = '6months', department } = req.query;

    // Calculate date range
    const currentDate = new Date();
    let monthsBack = 6;
    
    switch (timeframe) {
      case '1month':
        monthsBack = 1;
        break;
      case '3months':
        monthsBack = 3;
        break;
      case '6months':
        monthsBack = 6;
        break;
      case '1year':
        monthsBack = 12;
        break;
    }

    // Get students in department if specified
    let studentIds = [];
    if (department) {
      const students = await User.find({ department, role: 'student' }).select('studentId');
      studentIds = students.map(s => s.studentId);
    }

    const monthlyData = [];
    
    for (let i = monthsBack - 1; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });

      const query = {
        submittedAt: { $gte: monthDate, $lt: nextMonthDate }
      };

      if (studentIds.length > 0) {
        query.studentId = { $in: studentIds };
      }

      const [activities, verified, students] = await Promise.all([
        Activity.countDocuments(query),
        Activity.countDocuments({ ...query, status: 'verified' }),
        Activity.distinct('studentId', query)
      ]);

      monthlyData.push({
        month: monthName,
        activities,
        verified,
        students: students.length
      });
    }

    res.json({ monthlyData });
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get department performance
router.get('/departments', async (req, res) => {
  try {
    const departments = await User.distinct('department', { role: 'student' });

    const departmentStats = await Promise.all(
      departments.map(async (department) => {
        const students = await User.find({ department, role: 'student' });
        const studentIds = students.map(s => s.studentId);

        const [activities, verified, totalCredits, avgGPA] = await Promise.all([
          Activity.countDocuments({ studentId: { $in: studentIds } }),
          Activity.countDocuments({ studentId: { $in: studentIds }, status: 'verified' }),
          Activity.aggregate([
            { $match: { studentId: { $in: studentIds }, status: 'verified' } },
            { $group: { _id: null, total: { $sum: '$credits' } } }
          ]),
          User.aggregate([
            { $match: { department, role: 'student' } },
            { $group: { _id: null, avgGPA: { $avg: '$gpa' } } }
          ])
        ]);

        return {
          name: department,
          students: students.length,
          activities,
          verified,
          totalCredits: totalCredits[0]?.total || 0,
          avgGPA: avgGPA[0]?.avgGPA?.toFixed(1) || 0
        };
      })
    );

    res.json({ departments: departmentStats });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get activity type distribution
router.get('/activity-types', async (req, res) => {
  try {
    const { department } = req.query;

    let studentIds = [];
    if (department) {
      const students = await User.find({ department, role: 'student' }).select('studentId');
      studentIds = students.map(s => s.studentId);
    }

    const query = studentIds.length > 0 ? { studentId: { $in: studentIds } } : {};

    const activityTypes = await Activity.aggregate([
      { $match: query },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const total = activityTypes.reduce((sum, type) => sum + type.count, 0);

    const distribution = activityTypes.map(type => ({
      name: type._id.charAt(0).toUpperCase() + type._id.slice(1),
      count: type.count,
      percentage: ((type.count / total) * 100).toFixed(1),
      color: getActivityTypeColor(type._id)
    }));

    res.json({ activityTypes: distribution });
  } catch (error) {
    console.error('Get activity types error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get top performers
router.get('/top-performers', async (req, res) => {
  try {
    const { department, limit = 10 } = req.query;

    const userQuery = department ? { department, role: 'student' } : { role: 'student' };
    const students = await User.find(userQuery).select('studentId name department gpa');

    const performers = await Promise.all(
      students.map(async (student) => {
        const [totalActivities, verifiedActivities, totalCredits] = await Promise.all([
          Activity.countDocuments({ studentId: student.studentId }),
          Activity.countDocuments({ studentId: student.studentId, status: 'verified' }),
          Activity.aggregate([
            { $match: { studentId: student.studentId, status: 'verified' } },
            { $group: { _id: null, total: { $sum: '$credits' } } }
          ])
        ]);

        return {
          name: student.name,
          department: student.department,
          activities: totalActivities,
          verifiedActivities,
          credits: totalCredits[0]?.total || 0,
          gpa: student.gpa,
          score: (totalActivities * 0.3) + (verifiedActivities * 0.4) + (totalCredits * 0.2) + (student.gpa * 0.1)
        };
      })
    );

    // Sort by score and limit results
    const topPerformers = performers
      .sort((a, b) => b.score - a.score)
      .slice(0, parseInt(limit))
      .map((performer, index) => ({
        ...performer,
        rank: index + 1
      }));

    res.json({ topPerformers });
  } catch (error) {
    console.error('Get top performers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get accreditation status
router.get('/accreditation', async (req, res) => {
  try {
    const { department } = req.query;

    let studentIds = [];
    if (department) {
      const students = await User.find({ department, role: 'student' }).select('studentId');
      studentIds = students.map(s => s.studentId);
    }

    const query = studentIds.length > 0 ? { studentId: { $in: studentIds }, status: 'verified' } : { status: 'verified' };

    const [totalHours, activityTypes] = await Promise.all([
      Activity.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$credits' } } }
      ]),
      Activity.aggregate([
        { $match: query },
        { $group: { _id: '$type', total: { $sum: '$credits' } } }
      ])
    ]);

    const totalCredits = totalHours[0]?.total || 0;
    const requiredHours = 10000; // Example requirement
    const completionPercentage = ((totalCredits / requiredHours) * 100).toFixed(1);

    // Define accreditation categories
    const categories = [
      { name: 'Academic Excellence', required: 4000, type: 'certification' },
      { name: 'Research & Innovation', required: 2000, type: 'research' },
      { name: 'Community Service', required: 2000, type: 'volunteering' },
      { name: 'Professional Development', required: 2000, type: 'conference' }
    ];

    const accreditationCategories = await Promise.all(
      categories.map(async (category) => {
        const hours = activityTypes.find(type => type._id === category.type)?.total || 0;
        const status = hours >= category.required ? 'exceeded' : 
                      hours >= category.required * 0.8 ? 'met' : 'pending';

        return {
          name: category.name,
          hours,
          required: category.required,
          status
        };
      })
    );

    const accreditation = {
      totalHours: totalCredits,
      requiredHours,
      completionPercentage: parseFloat(completionPercentage),
      categories: accreditationCategories
    };

    res.json({ accreditation });
  } catch (error) {
    console.error('Get accreditation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate comprehensive report
router.get('/report', async (req, res) => {
  try {
    const { department, timeframe = '6months', format = 'json' } = req.query;

    // Get all analytics data
    const [overview, trends, departments, activityTypes, topPerformers, accreditation] = await Promise.all([
      getOverviewData(department, timeframe),
      getTrendsData(timeframe, department),
      getDepartmentsData(),
      getActivityTypesData(department),
      getTopPerformersData(department, 10),
      getAccreditationData(department)
    ]);

    const report = {
      generatedAt: new Date().toISOString(),
      timeframe,
      department: department || 'All Departments',
      overview,
      trends,
      departments,
      activityTypes,
      topPerformers,
      accreditation
    };

    if (format === 'pdf') {
      // In a real implementation, you would generate a PDF here
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics-report.pdf"');
      res.json({ message: 'PDF generation not implemented in demo' });
    } else {
      res.json({ report });
    }
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper functions
function getActivityTypeColor(type) {
  const colors = {
    certification: '#667eea',
    conference: '#764ba2',
    research: '#f093fb',
    volunteering: '#f5576c',
    competition: '#4ecdc4',
    internship: '#45b7d1'
  };
  return colors[type] || '#6b7280';
}

async function getOverviewData(department, timeframe) {
  // Implementation similar to /overview endpoint
  return { message: 'Overview data' };
}

async function getTrendsData(timeframe, department) {
  // Implementation similar to /trends endpoint
  return { message: 'Trends data' };
}

async function getDepartmentsData() {
  // Implementation similar to /departments endpoint
  return { message: 'Departments data' };
}

async function getActivityTypesData(department) {
  // Implementation similar to /activity-types endpoint
  return { message: 'Activity types data' };
}

async function getTopPerformersData(department, limit) {
  // Implementation similar to /top-performers endpoint
  return { message: 'Top performers data' };
}

async function getAccreditationData(department) {
  // Implementation similar to /accreditation endpoint
  return { message: 'Accreditation data' };
}

module.exports = router;
