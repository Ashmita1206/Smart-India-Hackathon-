import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  Calendar, 
  Award, 
  TrendingUp, 
  Users, 
  BookOpen,
  Clock,
  CheckCircle,
  Star,
  Activity,
  FileText,
  X,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import API from '../api';

const StudentDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalActivities: 0,
    verifiedActivities: 0,
    pendingActivities: 0,
    totalCredits: 0,
    gpa: 0,
    rank: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch student stats
        const statsResponse = await API.get(`/students/${user.id}/stats`);
        setStats(statsResponse.data);

        // Fetch recent activities
        const activitiesResponse = await API.get(`/students/${user.id}/activities?limit=4`);
        setRecentActivities(activitiesResponse.data);

        // Fetch achievements
        const achievementsResponse = await API.get(`/students/${user.id}/achievements`);
        setAchievements(achievementsResponse.data);

        // Fetch progress data
        const progressResponse = await API.get(`/students/${user.id}/progress`);
        setProgressData(progressResponse.data);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        
        // Set fallback data on error
        setStats({
          totalActivities: 0,
          verifiedActivities: 0,
          pendingActivities: 0,
          totalCredits: 0,
          gpa: 0,
          rank: 0
        });
        setRecentActivities([]);
        setAchievements([]);
        setProgressData([]);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.id) {
      fetchDashboardData();
    }
  }, [user]);

  const activityTypeData = [
    { name: 'Certifications', value: 8, color: '#667eea' },
    { name: 'Conferences', value: 5, color: '#764ba2' },
    { name: 'Research', value: 4, color: '#f093fb' },
    { name: 'Volunteering', value: 7, color: '#f5576c' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return CheckCircle;
      case 'pending': return Clock;
      case 'rejected': return X;
      default: return Activity;
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="main-content">
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="main-content">
          <div className="error-container">
            <AlertCircle size={48} className="error-icon" />
            <h3>Error Loading Dashboard</h3>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-btn"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="main-content">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="welcome-section"
        >
          <div className="welcome-content">
            <h1 className="welcome-title">
              Welcome back, <span className="gradient-text">{user.name}</span>!
            </h1>
            <p className="welcome-subtitle">
              Track your academic progress and showcase your achievements
            </p>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="welcome-avatar"
          >
            <img src={user.avatar} alt={user.name} />
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="stats-grid"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="stat-card"
          >
            <div className="stat-icon">
              <Activity size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalActivities}</div>
              <div className="stat-label">Total Activities</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="stat-card"
          >
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.verifiedActivities}</div>
              <div className="stat-label">Verified</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="stat-card"
          >
            <div className="stat-icon">
              <Target size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalCredits}</div>
              <div className="stat-label">Total Credits</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="stat-card"
          >
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.gpa}</div>
              <div className="stat-label">Current GPA</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Progress Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="card chart-card"
          >
            <div className="card-header">
              <h3 className="card-title">Activity Progress</h3>
              <TrendingUp size={20} className="card-icon" />
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="activities" 
                    stroke="#667eea" 
                    strokeWidth={3}
                    dot={{ fill: '#667eea', strokeWidth: 2, r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="credits" 
                    stroke="#764ba2" 
                    strokeWidth={3}
                    dot={{ fill: '#764ba2', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Activity Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="card chart-card"
          >
            <div className="card-header">
              <h3 className="card-title">Activity Types</h3>
              <Award size={20} className="card-icon" />
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={activityTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {activityTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-legend">
              {activityTypeData.map((item, index) => (
                <div key={index} className="legend-item">
                  <div 
                    className="legend-color" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="legend-label">{item.name}</span>
                  <span className="legend-value">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="card activities-card"
          >
            <div className="card-header">
              <h3 className="card-title">Recent Activities</h3>
              <Calendar size={20} className="card-icon" />
            </div>
            <div className="activities-list">
              {recentActivities.map((activity, index) => {
                const StatusIcon = getStatusIcon(activity.status);
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="activity-item"
                  >
                    <div className="activity-icon">
                      <StatusIcon 
                        size={20} 
                        color={getStatusColor(activity.status)} 
                      />
                    </div>
                    <div className="activity-content">
                      <h4 className="activity-title">{activity.title}</h4>
                      <p className="activity-meta">
                        {activity.type} • {activity.date} • {activity.credits} credits
                      </p>
                    </div>
                    <div className="activity-status">
                      <span 
                        className="status-badge"
                        style={{ 
                          backgroundColor: getStatusColor(activity.status) + '20',
                          color: getStatusColor(activity.status)
                        }}
                      >
                        {activity.status}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="card achievements-card"
          >
            <div className="card-header">
              <h3 className="card-title">Achievements</h3>
              <Trophy size={20} className="card-icon" />
            </div>
            <div className="achievements-grid">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className={`achievement-item ${achievement.earned ? 'earned' : 'locked'}`}
                  >
                    <div 
                      className="achievement-icon"
                      style={{ 
                        backgroundColor: achievement.earned ? achievement.color : '#e5e7eb',
                        color: achievement.earned ? 'white' : '#9ca3af'
                      }}
                    >
                      <Icon size={24} />
                    </div>
                    <div className="achievement-content">
                      <h4 className="achievement-title">{achievement.title}</h4>
                      <p className="achievement-description">{achievement.description}</p>
                    </div>
                    {achievement.earned && (
                      <div className="achievement-badge">
                        <CheckCircle size={16} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .main-content {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .welcome-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .welcome-content h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.5rem;
        }

        .welcome-subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.1rem;
        }

        .welcome-avatar img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 4px solid rgba(255, 255, 255, 0.3);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        .chart-card {
          grid-column: 1;
        }

        .activities-card {
          grid-column: 2;
          grid-row: 1;
        }

        .achievements-card {
          grid-column: 1 / -1;
          grid-row: 2;
        }

        .card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }

        .card-icon {
          color: #667eea;
        }

        .chart-container {
          height: 300px;
        }

        .chart-legend {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .legend-label {
          flex: 1;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .legend-value {
          font-weight: 600;
          color: #1f2937;
        }

        .activities-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(102, 126, 234, 0.05);
          border-radius: 12px;
          border-left: 4px solid #667eea;
          transition: all 0.3s ease;
        }

        .activity-item:hover {
          transform: translateX(5px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .activity-content {
          flex: 1;
        }

        .activity-title {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .activity-meta {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .achievement-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(102, 126, 234, 0.05);
          border-radius: 12px;
          position: relative;
          transition: all 0.3s ease;
        }

        .achievement-item.earned {
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .achievement-item.locked {
          opacity: 0.6;
        }

        .achievement-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .achievement-content {
          flex: 1;
        }

        .achievement-title {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .achievement-description {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .achievement-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          color: #10b981;
        }

        .loading-container,
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          text-align: center;
          color: white;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: white;
        }

        .error-container p {
          margin-bottom: 2rem;
          opacity: 0.8;
        }

        .retry-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .retry-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .chart-card {
            grid-column: 1;
          }

          .activities-card {
            grid-column: 1;
            grid-row: 2;
          }

          .achievements-card {
            grid-column: 1;
            grid-row: 3;
          }
        }

        @media (max-width: 768px) {
          .main-content {
            padding: 1rem;
          }

          .welcome-section {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .welcome-content h1 {
            font-size: 2rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .achievements-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;
