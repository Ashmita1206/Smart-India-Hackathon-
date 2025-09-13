import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Award, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  FileText,
  PieChart,
  Activity,
  Target,
  Star,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import API from '../api';

const AnalyticsReporting = ({ user }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await API.get('/analytics', {
          params: {
            timeframe: selectedTimeframe,
            department: selectedDepartment
          }
        });
        
        setAnalyticsData(response.data);

      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again.');
        
        // Set fallback data on error
        setAnalyticsData({
          overview: {
            totalStudents: 0,
            totalActivities: 0,
            verifiedActivities: 0,
            pendingActivities: 0,
            totalCredits: 0,
            averageGPA: 0,
            completionRate: 0
          },
          trends: {
            monthly: [],
            weekly: []
          },
          departments: [],
          activityTypes: [],
          topPerformers: [],
          accreditation: {
            totalHours: 0,
            requiredHours: 0,
            completionPercentage: 0,
            categories: []
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [selectedTimeframe, selectedDepartment]);

  const generateReport = async () => {
    try {
      setIsGeneratingReport(true);
      
      const response = await API.post('/analytics/generate-report', {
        timeframe: selectedTimeframe,
        department: selectedDepartment,
        format: 'pdf'
      }, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-report-${selectedTimeframe}-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'exceeded': return '#10b981';
      case 'met': return '#3b82f6';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'exceeded': return CheckCircle;
      case 'met': return CheckCircle;
      case 'pending': return Clock;
      default: return XCircle;
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner" />
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-loading">
        <AlertCircle size={48} className="error-icon" />
        <h3>Error Loading Analytics</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="retry-btn"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="analytics-reporting">
      <div className="main-content">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="page-header"
        >
          <div className="header-content">
            <h1 className="page-title">Analytics & Reporting</h1>
            <p className="page-subtitle">Comprehensive insights and institutional reports</p>
          </div>
          <div className="header-actions">
            <div className="filters">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="filter-select"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Departments</option>
                <option value="cs">Computer Science</option>
                <option value="engineering">Engineering</option>
                <option value="business">Business</option>
                <option value="medicine">Medicine</option>
              </select>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateReport}
              disabled={isGeneratingReport}
              className="generate-report-btn"
            >
              {isGeneratingReport ? (
                <RefreshCw size={20} className="spinning" />
              ) : (
                <Download size={20} />
              )}
              {isGeneratingReport ? 'Generating...' : 'Generate Report'}
            </motion.button>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="overview-stats"
        >
          <div className="stats-grid">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="stat-card"
            >
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{analyticsData.overview.totalStudents.toLocaleString()}</div>
                <div className="stat-label">Total Students</div>
                <div className="stat-change positive">+12% from last month</div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="stat-card"
            >
              <div className="stat-icon">
                <Activity size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{analyticsData.overview.totalActivities.toLocaleString()}</div>
                <div className="stat-label">Total Activities</div>
                <div className="stat-change positive">+18% from last month</div>
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
                <div className="stat-number">{analyticsData.overview.verifiedActivities.toLocaleString()}</div>
                <div className="stat-label">Verified Activities</div>
                <div className="stat-change positive">+15% from last month</div>
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
                <div className="stat-number">{analyticsData.overview.totalCredits.toLocaleString()}</div>
                <div className="stat-label">Total Credits</div>
                <div className="stat-change positive">+22% from last month</div>
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
                <div className="stat-number">{analyticsData.overview.averageGPA}</div>
                <div className="stat-label">Average GPA</div>
                <div className="stat-change positive">+0.1 from last month</div>
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
                <div className="stat-number">{analyticsData.overview.completionRate}%</div>
                <div className="stat-label">Completion Rate</div>
                <div className="stat-change positive">+3% from last month</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Analytics Grid */}
        <div className="analytics-grid">
          {/* Activity Trends */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="card trends-card"
          >
            <div className="card-header">
              <h3 className="card-title">Activity Trends</h3>
              <TrendingUp size={20} className="card-icon" />
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.trends.monthly}>
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
                  <Area 
                    type="monotone" 
                    dataKey="activities" 
                    stackId="1"
                    stroke="#667eea" 
                    fill="#667eea"
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="verified" 
                    stackId="2"
                    stroke="#10b981" 
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Activity Types Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="card distribution-card"
          >
            <div className="card-header">
              <h3 className="card-title">Activity Types</h3>
              <PieChart size={20} className="card-icon" />
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={analyticsData.activityTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {analyticsData.activityTypes.map((entry, index) => (
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
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Department Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="card departments-card"
          >
            <div className="card-header">
              <h3 className="card-title">Department Performance</h3>
              <BarChart3 size={20} className="card-icon" />
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.departments}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
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

          {/* Top Performers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="card performers-card"
          >
            <div className="card-header">
              <h3 className="card-title">Top Performers</h3>
              <Star size={20} className="card-icon" />
            </div>
            <div className="performers-list">
              {analyticsData.topPerformers.map((performer, index) => (
                <motion.div
                  key={performer.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="performer-item"
                >
                  <div className="performer-rank">
                    <span className="rank-number">{performer.rank}</span>
                  </div>
                  <div className="performer-info">
                    <div className="performer-name">{performer.name}</div>
                    <div className="performer-department">{performer.department}</div>
                  </div>
                  <div className="performer-stats">
                    <div className="stat">
                      <span className="stat-value">{performer.activities}</span>
                      <span className="stat-label">Activities</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{performer.credits}</span>
                      <span className="stat-label">Credits</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{performer.gpa}</span>
                      <span className="stat-label">GPA</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Accreditation Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="card accreditation-card"
          >
            <div className="card-header">
              <h3 className="card-title">Accreditation Status</h3>
              <Target size={20} className="card-icon" />
            </div>
            <div className="accreditation-content">
              <div className="accreditation-overview">
                <div className="overview-stat">
                  <div className="stat-number">{analyticsData.accreditation.totalHours.toLocaleString()}</div>
                  <div className="stat-label">Total Hours</div>
                </div>
                <div className="overview-stat">
                  <div className="stat-number">{analyticsData.accreditation.completionPercentage}%</div>
                  <div className="stat-label">Completion</div>
                </div>
              </div>
              
              <div className="accreditation-categories">
                {analyticsData.accreditation.categories.map((category, index) => {
                  const StatusIcon = getStatusIcon(category.status);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="category-item"
                    >
                      <div className="category-header">
                        <h4 className="category-name">{category.name}</h4>
                        <div className="category-status">
                          <StatusIcon 
                            size={16} 
                            color={getStatusColor(category.status)} 
                          />
                          <span 
                            className="status-text"
                            style={{ color: getStatusColor(category.status) }}
                          >
                            {category.status}
                          </span>
                        </div>
                      </div>
                      <div className="category-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ 
                              width: `${Math.min(100, (category.hours / category.required) * 100)}%`,
                              backgroundColor: getStatusColor(category.status)
                            }}
                          />
                        </div>
                        <div className="progress-text">
                          <span>{category.hours.toLocaleString()} / {category.required.toLocaleString()} hours</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .analytics-reporting {
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

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .filters {
          display: flex;
          gap: 0.5rem;
        }

        .filter-select {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-weight: 500;
          cursor: pointer;
        }

        .filter-select option {
          background: #1f2937;
          color: white;
        }

        .generate-report-btn {
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

        .generate-report-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .generate-report-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .analytics-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          color: white;
          text-align: center;
        }

        .analytics-loading h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: white;
        }

        .analytics-loading p {
          margin-bottom: 2rem;
          opacity: 0.8;
        }

        .error-icon {
          color: #ef4444;
          margin-bottom: 1rem;
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

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        .overview-stats {
          margin-bottom: 2rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
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
          margin-bottom: 0.25rem;
        }

        .stat-change {
          font-size: 0.75rem;
          font-weight: 600;
        }

        .stat-change.positive {
          color: #10b981;
        }

        .stat-change.negative {
          color: #ef4444;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          grid-template-rows: auto auto;
          gap: 2rem;
        }

        .trends-card {
          grid-column: 1;
          grid-row: 1;
        }

        .distribution-card {
          grid-column: 2;
          grid-row: 1;
        }

        .departments-card {
          grid-column: 1;
          grid-row: 2;
        }

        .performers-card {
          grid-column: 2;
          grid-row: 2;
        }

        .accreditation-card {
          grid-column: 1 / -1;
          grid-row: 3;
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

        .performers-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .performer-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .performer-item:hover {
          background: #f3f4f6;
          transform: translateX(5px);
        }

        .performer-rank {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
        }

        .rank-number {
          font-size: 1.25rem;
        }

        .performer-info {
          flex: 1;
        }

        .performer-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .performer-department {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .performer-stats {
          display: flex;
          gap: 1rem;
        }

        .stat {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-weight: 700;
          color: #1f2937;
          font-size: 1.1rem;
        }

        .stat-label {
          display: block;
          color: #6b7280;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .accreditation-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .accreditation-overview {
          display: flex;
          gap: 2rem;
          justify-content: center;
        }

        .overview-stat {
          text-align: center;
        }

        .overview-stat .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .overview-stat .stat-label {
          color: #6b7280;
          font-size: 1rem;
          font-weight: 500;
        }

        .accreditation-categories {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .category-item {
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 12px;
          border-left: 4px solid #667eea;
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .category-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .category-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-text {
          font-weight: 600;
          text-transform: capitalize;
          font-size: 0.875rem;
        }

        .category-progress {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .progress-bar {
          background: #e5e7eb;
          border-radius: 10px;
          height: 8px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 10px;
          transition: width 0.8s ease;
        }

        .progress-text {
          display: flex;
          justify-content: space-between;
          color: #6b7280;
          font-size: 0.875rem;
        }

        @media (max-width: 1024px) {
          .analytics-grid {
            grid-template-columns: 1fr;
          }

          .trends-card,
          .distribution-card,
          .departments-card,
          .performers-card,
          .accreditation-card {
            grid-column: 1;
          }

          .trends-card {
            grid-row: 1;
          }

          .distribution-card {
            grid-row: 2;
          }

          .departments-card {
            grid-row: 3;
          }

          .performers-card {
            grid-row: 4;
          }

          .accreditation-card {
            grid-row: 5;
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

          .header-actions {
            flex-direction: column;
            width: 100%;
          }

          .filters {
            flex-direction: column;
            width: 100%;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .performer-stats {
            flex-direction: column;
            gap: 0.5rem;
          }

          .accreditation-overview {
            flex-direction: column;
            gap: 1rem;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .card {
            padding: 1.5rem;
          }

          .performer-item {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
          }

          .performer-stats {
            flex-direction: row;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsReporting;
