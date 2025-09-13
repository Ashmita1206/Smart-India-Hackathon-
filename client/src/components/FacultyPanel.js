import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Download,
  Filter,
  Search,
  Eye,
  Award,
  Calendar,
  TrendingUp,
  BarChart3,
  User,
  Mail,
  Phone,
  AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import API from '../api';

const FacultyPanel = ({ user }) => {
  const [pendingActivities, setPendingActivities] = useState([]);
  const [allActivities, setAllActivities] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingApprovals: 0,
    verifiedActivities: 0,
    totalCredits: 0
  });

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch pending activities
        const pendingResponse = await API.get('/faculty/pending-activities');
        setPendingActivities(pendingResponse.data);

        // Fetch all activities
        const allActivitiesResponse = await API.get('/faculty/all-activities');
        setAllActivities(allActivitiesResponse.data);

        // Fetch students
        const studentsResponse = await API.get('/faculty/students');
        setStudents(studentsResponse.data);

        // Fetch stats
        const statsResponse = await API.get('/faculty/stats');
        setStats(statsResponse.data);

      } catch (err) {
        console.error('Error fetching faculty data:', err);
        setError('Failed to load faculty data. Please try again.');
        
        // Set fallback data on error
        setPendingActivities([]);
        setAllActivities([]);
        setStudents([]);
        setStats({
          totalStudents: 0,
          pendingApprovals: 0,
          verifiedActivities: 0,
          totalCredits: 0
        });
      } finally {
        setLoading(false);
      }
    };

    if (user && user.id) {
      fetchFacultyData();
    }
  }, [user]);

  const handleApprove = async (activityId) => {
    try {
      await API.patch(`/activities/${activityId}/approve`, {
        verifiedBy: user.name,
        verifiedAt: new Date().toISOString()
      });

      setPendingActivities(prev => 
        prev.filter(activity => activity.id !== activityId)
      );
      setAllActivities(prev => 
        prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, status: 'verified', verifiedAt: new Date().toISOString(), verifiedBy: user.name }
            : activity
        )
      );
      setShowActivityModal(false);
    } catch (err) {
      console.error('Error approving activity:', err);
      setError('Failed to approve activity. Please try again.');
    }
  };

  const handleReject = async (activityId, reason) => {
    try {
      await API.patch(`/activities/${activityId}/reject`, {
        rejectedBy: user.name,
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason
      });

      setPendingActivities(prev => 
        prev.filter(activity => activity.id !== activityId)
      );
      setAllActivities(prev => 
        prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, status: 'rejected', rejectedAt: new Date().toISOString(), rejectedBy: user.name, rejectionReason: reason }
            : activity
        )
      );
      setShowActivityModal(false);
    } catch (err) {
      console.error('Error rejecting activity:', err);
      setError('Failed to reject activity. Please try again.');
    }
  };

  const filteredActivities = allActivities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.status === filter;
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activityTypeData = [
    { name: 'Certifications', value: 8, color: '#667eea' },
    { name: 'Conferences', value: 5, color: '#764ba2' },
    { name: 'Research', value: 4, color: '#f093fb' },
    { name: 'Volunteering', value: 7, color: '#f5576c' }
  ];

  const monthlyData = [
    { month: 'Sep', activities: 12, verified: 10 },
    { month: 'Oct', activities: 18, verified: 15 },
    { month: 'Nov', activities: 15, verified: 12 },
    { month: 'Dec', activities: 22, verified: 18 },
    { month: 'Jan', activities: 25, verified: 20 }
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
      case 'rejected': return XCircle;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="faculty-panel">
        <div className="main-content">
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Loading faculty panel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="faculty-panel">
      <div className="main-content">
        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="error-banner"
          >
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="close-error">
              <XCircle size={16} />
            </button>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="page-header"
        >
          <div className="header-content">
            <h1 className="page-title">Faculty Panel</h1>
            <p className="page-subtitle">Manage student activities and generate reports</p>
          </div>
          <div className="header-actions">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="export-btn"
            >
              <Download size={20} />
              Export Report
            </motion.button>
          </div>
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
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalStudents}</div>
              <div className="stat-label">Total Students</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="stat-card"
          >
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.pendingApprovals}</div>
              <div className="stat-label">Pending Approvals</div>
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
              <div className="stat-label">Verified Activities</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="stat-card"
          >
            <div className="stat-icon">
              <Award size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalCredits}</div>
              <div className="stat-label">Total Credits</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="faculty-grid">
          {/* Pending Activities */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="card pending-activities"
          >
            <div className="card-header">
              <h3 className="card-title">Pending Approvals</h3>
              <Clock size={20} className="card-icon" />
            </div>
            <div className="activities-list">
              {pendingActivities.length === 0 ? (
                <div className="empty-state">
                  <CheckCircle size={48} className="empty-icon" />
                  <p>No pending approvals</p>
                </div>
              ) : (
                pendingActivities.map((activity, index) => {
                  const StatusIcon = getStatusIcon(activity.status);
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="activity-item"
                      onClick={() => {
                        setSelectedActivity(activity);
                        setShowActivityModal(true);
                      }}
                    >
                      <div className="activity-header">
                        <h4 className="activity-title">{activity.title}</h4>
                        <StatusIcon 
                          size={16} 
                          color={getStatusColor(activity.status)} 
                        />
                      </div>
                      <div className="activity-meta">
                        <div className="student-info">
                          <User size={14} />
                          <span>{activity.studentName}</span>
                        </div>
                        <div className="activity-date">
                          <Calendar size={14} />
                          <span>{new Date(activity.date).toLocaleDateString()}</span>
                        </div>
                        <div className="activity-credits">
                          <Award size={14} />
                          <span>{activity.credits} credits</span>
                        </div>
                      </div>
                      <div className="activity-actions">
                        <button className="view-btn">
                          <Eye size={16} />
                          Review
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Analytics Charts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="card analytics-card"
          >
            <div className="card-header">
              <h3 className="card-title">Activity Analytics</h3>
              <BarChart3 size={20} className="card-icon" />
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData}>
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
                  <Bar dataKey="activities" fill="#667eea" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="verified" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Activity Types Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="card distribution-card"
          >
            <div className="card-header">
              <h3 className="card-title">Activity Types</h3>
              <TrendingUp size={20} className="card-icon" />
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={activityTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
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

          {/* All Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="card all-activities"
          >
            <div className="card-header">
              <h3 className="card-title">All Activities</h3>
              <FileText size={20} className="card-icon" />
            </div>
            
            <div className="filters-section">
              <div className="search-box">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="filter-buttons">
                {['all', 'pending', 'verified', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`filter-btn ${filter === status ? 'active' : ''}`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="activities-table">
              <div className="table-header">
                <div className="table-cell">Student</div>
                <div className="table-cell">Activity</div>
                <div className="table-cell">Type</div>
                <div className="table-cell">Credits</div>
                <div className="table-cell">Status</div>
                <div className="table-cell">Date</div>
              </div>
              {filteredActivities.map((activity, index) => {
                const StatusIcon = getStatusIcon(activity.status);
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="table-row"
                    onClick={() => {
                      setSelectedActivity(activity);
                      setShowActivityModal(true);
                    }}
                  >
                    <div className="table-cell">
                      <div className="student-cell">
                        <div className="student-avatar">
                          {activity.studentName.charAt(0)}
                        </div>
                        <div className="student-info">
                          <div className="student-name">{activity.studentName}</div>
                          <div className="student-id">{activity.studentId}</div>
                        </div>
                      </div>
                    </div>
                    <div className="table-cell">
                      <div className="activity-title">{activity.title}</div>
                    </div>
                    <div className="table-cell">
                      <span className="activity-type">{activity.type}</span>
                    </div>
                    <div className="table-cell">
                      <span className="credits">{activity.credits}</span>
                    </div>
                    <div className="table-cell">
                      <div className="status-cell">
                        <StatusIcon 
                          size={16} 
                          color={getStatusColor(activity.status)} 
                        />
                        <span 
                          className="status-text"
                          style={{ color: getStatusColor(activity.status) }}
                        >
                          {activity.status}
                        </span>
                      </div>
                    </div>
                    <div className="table-cell">
                      <span className="date">{new Date(activity.date).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Activity Review Modal */}
        <AnimatePresence>
          {showActivityModal && selectedActivity && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setShowActivityModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Review Activity</h2>
                  <button
                    onClick={() => setShowActivityModal(false)}
                    className="close-btn"
                  >
                    <XCircle size={24} />
                  </button>
                </div>

                <div className="activity-review">
                  <div className="activity-details">
                    <h3>{selectedActivity.title}</h3>
                    <p className="activity-description">{selectedActivity.description}</p>
                    
                    <div className="activity-meta">
                      <div className="meta-item">
                        <User size={16} />
                        <span>{selectedActivity.studentName}</span>
                      </div>
                      <div className="meta-item">
                        <Mail size={16} />
                        <span>{selectedActivity.studentEmail}</span>
                      </div>
                      <div className="meta-item">
                        <Calendar size={16} />
                        <span>{new Date(selectedActivity.date).toLocaleDateString()}</span>
                      </div>
                      <div className="meta-item">
                        <Award size={16} />
                        <span>{selectedActivity.credits} credits</span>
                      </div>
                    </div>

                    {selectedActivity.files && selectedActivity.files.length > 0 && (
                      <div className="activity-files">
                        <h4>Attached Files:</h4>
                        <div className="files-list">
                          {selectedActivity.files.map((file, index) => (
                            <div key={index} className="file-item">
                              <FileText size={16} />
                              <span>{file.name}</span>
                              <button className="download-btn">
                                <Download size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="review-actions">
                    <button
                      onClick={() => handleReject(selectedActivity.id, 'Document quality insufficient')}
                      className="reject-btn"
                    >
                      <XCircle size={20} />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(selectedActivity.id)}
                      className="approve-btn"
                    >
                      <CheckCircle size={20} />
                      Approve
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .faculty-panel {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .main-content {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
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

        .page-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.1rem;
        }

        .export-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .export-btn:hover {
          background: rgba(255, 255, 255, 0.3);
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

        .faculty-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: auto auto;
          gap: 2rem;
        }

        .pending-activities {
          grid-column: 1;
          grid-row: 1;
        }

        .analytics-card {
          grid-column: 2;
          grid-row: 1;
        }

        .distribution-card {
          grid-column: 1;
          grid-row: 2;
        }

        .all-activities {
          grid-column: 2;
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

        .activities-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }

        .empty-icon {
          color: #10b981;
          margin-bottom: 1rem;
        }

        .activity-item {
          padding: 1rem;
          background: rgba(102, 126, 234, 0.05);
          border-radius: 12px;
          border-left: 4px solid #667eea;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .activity-item:hover {
          transform: translateX(5px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .activity-title {
          font-weight: 600;
          color: #1f2937;
        }

        .activity-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .activity-actions {
          display: flex;
          justify-content: flex-end;
        }

        .view-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .view-btn:hover {
          background: #5a67d8;
        }

        .chart-container {
          height: 200px;
          margin-bottom: 1rem;
        }

        .chart-legend {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
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

        .filters-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          gap: 1rem;
        }

        .search-box {
          position: relative;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.875rem;
          background: white;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .filter-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-btn:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .filter-btn.active {
          background: #667eea;
          border-color: #667eea;
          color: white;
        }

        .activities-table {
          display: flex;
          flex-direction: column;
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr;
          gap: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 12px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr;
          gap: 1rem;
          padding: 1rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }

        .table-row:hover {
          background: rgba(102, 126, 234, 0.05);
          border-color: rgba(102, 126, 234, 0.2);
        }

        .table-cell {
          display: flex;
          align-items: center;
          font-size: 0.875rem;
        }

        .student-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .student-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .student-name {
          font-weight: 600;
          color: #1f2937;
        }

        .student-id {
          color: #6b7280;
          font-size: 0.75rem;
        }

        .activity-title {
          font-weight: 500;
          color: #1f2937;
        }

        .activity-type {
          background: #f3f4f6;
          color: #374151;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .credits {
          font-weight: 600;
          color: #1f2937;
        }

        .status-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-text {
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
        }

        .date {
          color: #6b7280;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 2rem 0;
        }

        .modal-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
        }

        .close-btn {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .activity-review {
          padding: 2rem;
        }

        .activity-details h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .activity-description {
          color: #6b7280;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .activity-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .activity-files {
          margin-bottom: 2rem;
        }

        .activity-files h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 1rem;
        }

        .files-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .file-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .download-btn {
          margin-left: auto;
          background: #667eea;
          color: white;
          border: none;
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .download-btn:hover {
          background: #5a67d8;
        }

        .review-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .reject-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .reject-btn:hover {
          background: #dc2626;
        }

        .approve-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .approve-btn:hover {
          background: #059669;
        }

        .loading-container {
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

        .error-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1rem;
          backdrop-filter: blur(10px);
        }

        .error-banner span {
          flex: 1;
        }

        .close-error {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: background 0.3s ease;
        }

        .close-error:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        @media (max-width: 1024px) {
          .faculty-grid {
            grid-template-columns: 1fr;
          }

          .pending-activities,
          .analytics-card,
          .distribution-card,
          .all-activities {
            grid-column: 1;
          }

          .pending-activities {
            grid-row: 1;
          }

          .analytics-card {
            grid-row: 2;
          }

          .distribution-card {
            grid-row: 3;
          }

          .all-activities {
            grid-row: 4;
          }
        }

        @media (max-width: 768px) {
          .main-content {
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .page-title {
            font-size: 2rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .table-header,
          .table-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .filters-section {
            flex-direction: column;
            gap: 1rem;
          }

          .filter-buttons {
            flex-wrap: wrap;
          }

          .activity-meta {
            grid-template-columns: 1fr;
          }

          .review-actions {
            flex-direction: column;
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

export default FacultyPanel;
