import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Calendar, 
  Award, 
  Users, 
  BookOpen,
  Camera,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Filter,
  Search,
  Trophy,
  Briefcase
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

const ActivityTracker = ({ user }) => {
  const [activities, setActivities] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newActivity, setNewActivity] = useState({
    title: '',
    type: 'certification',
    description: '',
    date: '',
    credits: 1,
    files: []
  });

  const activityTypes = [
    { value: 'certification', label: 'Certification', icon: Award, color: '#667eea' },
    { value: 'conference', label: 'Conference', icon: Users, color: '#764ba2' },
    { value: 'research', label: 'Research', icon: BookOpen, color: '#f093fb' },
    { value: 'volunteering', label: 'Volunteering', icon: Users, color: '#f5576c' },
    { value: 'competition', label: 'Competition', icon: Trophy, color: '#4ecdc4' },
    { value: 'internship', label: 'Internship', icon: Briefcase, color: '#45b7d1' }
  ];

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file)
    }));
    
    setNewActivity(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const removeFile = (fileId) => {
    setNewActivity(prev => ({
      ...prev,
      files: prev.files.filter(file => file.id !== fileId)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const activity = {
      id: Date.now(),
      ...newActivity,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      studentId: user.studentId,
      studentName: user.name
    };

    setActivities(prev => [activity, ...prev]);
    setNewActivity({
      title: '',
      type: 'certification',
      description: '',
      date: '',
      credits: 1,
      files: []
    });
    setShowAddModal(false);
  };

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.status === filter;
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
      case 'rejected': return AlertCircle;
      default: return Clock;
    }
  };

  const getActivityTypeIcon = (type) => {
    const activityType = activityTypes.find(t => t.value === type);
    return activityType ? activityType.icon : FileText;
  };

  const getActivityTypeColor = (type) => {
    const activityType = activityTypes.find(t => t.value === type);
    return activityType ? activityType.color : '#6b7280';
  };

  return (
    <div className="activity-tracker">
      <div className="main-content">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="page-header"
        >
          <div className="header-content">
            <h1 className="page-title">Activity Tracker</h1>
            <p className="page-subtitle">Upload and manage your academic activities</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="add-activity-btn"
          >
            <Plus size={20} />
            Add Activity
          </motion.button>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="filters-section"
        >
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
        </motion.div>

        {/* Activities List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="activities-section"
        >
          <AnimatePresence>
            {filteredActivities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="empty-state"
              >
                <FileText size={64} className="empty-icon" />
                <h3>No activities found</h3>
                <p>Start by adding your first activity to track your progress</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary"
                >
                  Add Your First Activity
                </button>
              </motion.div>
            ) : (
              <div className="activities-grid">
                {filteredActivities.map((activity, index) => {
                  const StatusIcon = getStatusIcon(activity.status);
                  const TypeIcon = getActivityTypeIcon(activity.type);
                  
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: 0.1 * index }}
                      className="activity-card"
                    >
                      <div className="activity-header">
                        <div className="activity-type">
                          <div 
                            className="type-icon"
                            style={{ backgroundColor: getActivityTypeColor(activity.type) }}
                          >
                            <TypeIcon size={20} />
                          </div>
                          <span className="type-label">
                            {activityTypes.find(t => t.value === activity.type)?.label}
                          </span>
                        </div>
                        <div className="activity-status">
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

                      <div className="activity-content">
                        <h3 className="activity-title">{activity.title}</h3>
                        <p className="activity-description">{activity.description}</p>
                        
                        <div className="activity-meta">
                          <div className="meta-item">
                            <Calendar size={16} />
                            <span>{new Date(activity.date).toLocaleDateString()}</span>
                          </div>
                          <div className="meta-item">
                            <Award size={16} />
                            <span>{activity.credits} credits</span>
                          </div>
                        </div>

                        {activity.files.length > 0 && (
                          <div className="activity-files">
                            <h4>Attachments:</h4>
                            <div className="files-list">
                              {activity.files.map((file) => (
                                <div key={file.id} className="file-item">
                                  <FileText size={16} />
                                  <span>{file.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {activity.status === 'rejected' && (
                        <div className="rejection-reason">
                          <AlertCircle size={16} />
                          <span>Reason: Document quality insufficient</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Add Activity Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Add New Activity</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="close-btn"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="activity-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Activity Title</label>
                      <input
                        type="text"
                        value={newActivity.title}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                        className="form-input"
                        placeholder="Enter activity title"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Activity Type</label>
                      <select
                        value={newActivity.type}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, type: e.target.value }))}
                        className="form-input"
                      >
                        {activityTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      value={newActivity.description}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                      className="form-input form-textarea"
                      placeholder="Describe your activity..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        value={newActivity.date}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, date: e.target.value }))}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Credits</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={newActivity.credits}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Upload Documents</label>
                    <div
                      {...getRootProps()}
                      className={`upload-area ${isDragActive ? 'dragover' : ''}`}
                    >
                      <input {...getInputProps()} />
                      <Upload size={32} className="upload-icon" />
                      <p className="upload-text">
                        {isDragActive
                          ? 'Drop the files here...'
                          : 'Drag & drop files here, or click to select files'
                        }
                      </p>
                      <p className="upload-hint">Supports: PDF, DOC, DOCX, PNG, JPG (Max 10MB)</p>
                    </div>

                    {newActivity.files.length > 0 && (
                      <div className="uploaded-files">
                        {newActivity.files.map((file) => (
                          <div key={file.id} className="uploaded-file">
                            <FileText size={16} />
                            <span>{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(file.id)}
                              className="remove-file-btn"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Submit Activity
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .activity-tracker {
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

        .add-activity-btn {
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

        .add-activity-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .filters-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .search-box {
          position: relative;
          flex: 1;
          max-width: 400px;
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
          padding: 0.875rem 1rem 0.875rem 3rem;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          font-size: 1rem;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          backdrop-filter: blur(10px);
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .search-input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.4);
        }

        .filter-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .filter-btn {
          padding: 0.75rem 1.5rem;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .filter-btn.active {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .activities-section {
          margin-bottom: 2rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .empty-icon {
          color: #9ca3af;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #6b7280;
          margin-bottom: 2rem;
        }

        .activities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .activity-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .activity-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .activity-type {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .type-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .type-label {
          font-weight: 600;
          color: #1f2937;
        }

        .activity-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-text {
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.875rem;
        }

        .activity-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .activity-description {
          color: #6b7280;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .activity-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .activity-files {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .activity-files h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .files-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .file-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .rejection-reason {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 8px;
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 1rem;
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

        .activity-form {
          padding: 2rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #374151;
        }

        .form-input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-textarea {
          min-height: 120px;
          resize: vertical;
        }

        .upload-area {
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .upload-area:hover,
        .upload-area.dragover {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }

        .upload-icon {
          color: #9ca3af;
          margin-bottom: 1rem;
        }

        .upload-text {
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .upload-hint {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .uploaded-files {
          margin-top: 1rem;
        }

        .uploaded-file {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 8px;
          margin-bottom: 0.5rem;
        }

        .remove-file-btn {
          margin-left: auto;
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
        }

        .remove-file-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          padding: 0.875rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: #f3f4f6;
          border: 2px solid #e5e7eb;
          color: #374151;
          padding: 0.875rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
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

          .filters-section {
            flex-direction: column;
            gap: 1rem;
          }

          .filter-buttons {
            flex-wrap: wrap;
          }

          .activities-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .modal-overlay {
            padding: 1rem;
          }

          .modal-content {
            max-height: 95vh;
          }
        }
      `}</style>
    </div>
  );
};

export default ActivityTracker;
