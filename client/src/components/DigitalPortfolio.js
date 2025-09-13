import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Share2, 
  Eye, 
  Award, 
  Calendar, 
  MapPin,
  Mail,
  Phone,
  Globe,
  FileText,
  Trophy,
  Users,
  BookOpen,
  Briefcase,
  Star,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const DigitalPortfolio = ({ user }) => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [selectedSection, setSelectedSection] = useState('overview');
  const portfolioRef = useRef(null);

  useEffect(() => {
    // Simulate loading portfolio data
    setTimeout(() => {
      setPortfolioData({
        personalInfo: {
          name: user.name,
          email: 'alex.johnson@university.edu',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA',
          website: 'alexjohnson.dev',
          linkedin: 'linkedin.com/in/alexjohnson',
          github: 'github.com/alexjohnson',
          bio: 'Passionate Computer Science student with a focus on software development and research. Experienced in full-stack development, machine learning, and open-source contributions.'
        },
        academicInfo: {
          degree: 'Bachelor of Science in Computer Science',
          university: 'University of Technology',
          gpa: 3.8,
          graduationYear: '2024',
          major: 'Computer Science',
          minor: 'Mathematics'
        },
        achievements: [
          {
            id: 1,
            title: 'Dean\'s List',
            description: 'Maintained GPA above 3.5 for 4 consecutive semesters',
            date: '2023',
            type: 'academic',
            verified: true
          },
          {
            id: 2,
            title: 'Research Excellence Award',
            description: 'Outstanding contribution to machine learning research',
            date: '2023',
            type: 'research',
            verified: true
          },
          {
            id: 3,
            title: 'Hackathon Winner',
            description: 'First place in University Tech Innovation Challenge',
            date: '2023',
            type: 'competition',
            verified: true
          },
          {
            id: 4,
            title: 'Community Service Leader',
            description: 'Organized 5+ community service events',
            date: '2023',
            type: 'volunteering',
            verified: true
          }
        ],
        activities: [
          {
            id: 1,
            title: 'Python Programming Certificate',
            type: 'certification',
            organization: 'Python Institute',
            date: '2024-01-15',
            credits: 3,
            description: 'Comprehensive Python programming course covering advanced concepts',
            verified: true
          },
          {
            id: 2,
            title: 'Tech Conference 2024',
            type: 'conference',
            organization: 'Tech Innovation Summit',
            date: '2024-01-10',
            credits: 2,
            description: 'Presented research on AI applications in healthcare',
            verified: true
          },
          {
            id: 3,
            title: 'Research Paper Publication',
            type: 'research',
            organization: 'IEEE Computer Society',
            date: '2024-01-05',
            credits: 5,
            description: 'Published paper on machine learning optimization techniques',
            verified: true
          },
          {
            id: 4,
            title: 'Community Service Project',
            type: 'volunteering',
            organization: 'Local Community Center',
            date: '2024-01-08',
            credits: 1,
            description: 'Organized food drive serving 200+ families',
            verified: true
          }
        ],
        skills: {
          technical: ['Python', 'JavaScript', 'React', 'Node.js', 'Machine Learning', 'Data Science', 'Git', 'Docker'],
          soft: ['Leadership', 'Teamwork', 'Problem Solving', 'Communication', 'Project Management', 'Public Speaking']
        },
        projects: [
          {
            id: 1,
            title: 'Smart Student Hub',
            description: 'Comprehensive student activity tracking platform with React and Node.js',
            technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
            github: 'github.com/alexjohnson/smart-student-hub',
            demo: 'smart-student-hub.vercel.app',
            status: 'completed'
          },
          {
            id: 2,
            title: 'AI-Powered Study Assistant',
            description: 'Machine learning application for personalized study recommendations',
            technologies: ['Python', 'TensorFlow', 'Flask', 'PostgreSQL'],
            github: 'github.com/alexjohnson/ai-study-assistant',
            demo: 'ai-study-assistant.herokuapp.com',
            status: 'in-progress'
          }
        ]
      });

      // Generate shareable link
      setShareLink(`https://portfolio.smartstudenthub.com/${user.studentId}`);
    }, 1000);
  }, [user]);

  const generatePDF = async () => {
    if (!portfolioRef.current) return;
    
    setIsGeneratingPDF(true);
    
    try {
      const canvas = await html2canvas(portfolioRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${user.name.replace(' ', '_')}_Portfolio.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const getActivityTypeIcon = (type) => {
    switch (type) {
      case 'certification': return Award;
      case 'conference': return Users;
      case 'research': return BookOpen;
      case 'volunteering': return Users;
      case 'competition': return Trophy;
      case 'internship': return Briefcase;
      default: return FileText;
    }
  };

  const getActivityTypeColor = (type) => {
    switch (type) {
      case 'certification': return '#667eea';
      case 'conference': return '#764ba2';
      case 'research': return '#f093fb';
      case 'volunteering': return '#f5576c';
      case 'competition': return '#4ecdc4';
      case 'internship': return '#45b7d1';
      default: return '#6b7280';
    }
  };

  if (!portfolioData) {
    return (
      <div className="portfolio-loading">
        <div className="loading-spinner" />
        <p>Generating your portfolio...</p>
      </div>
    );
  }

  return (
    <div className="digital-portfolio">
      <div className="main-content">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="page-header"
        >
          <div className="header-content">
            <h1 className="page-title">Digital Portfolio</h1>
            <p className="page-subtitle">Your comprehensive academic and professional profile</p>
          </div>
          <div className="header-actions">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyShareLink}
              className="share-btn"
            >
              {linkCopied ? <Check size={20} /> : <Copy size={20} />}
              {linkCopied ? 'Copied!' : 'Copy Link'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="export-btn"
            >
              {isGeneratingPDF ? (
                <div className="loading-spinner" />
              ) : (
                <Download size={20} />
              )}
              {isGeneratingPDF ? 'Generating...' : 'Export PDF'}
            </motion.button>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="portfolio-nav"
        >
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'achievements', label: 'Achievements' },
            { id: 'activities', label: 'Activities' },
            { id: 'projects', label: 'Projects' },
            { id: 'skills', label: 'Skills' }
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setSelectedSection(section.id)}
              className={`nav-item ${selectedSection === section.id ? 'active' : ''}`}
            >
              {section.label}
            </button>
          ))}
        </motion.div>

        {/* Portfolio Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="portfolio-content"
        >
          <div ref={portfolioRef} className="portfolio-document">
            {/* Overview Section */}
            {selectedSection === 'overview' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="portfolio-section"
              >
                <div className="section-header">
                  <h2>Personal Information</h2>
                </div>
                
                <div className="personal-info">
                  <div className="profile-section">
                    <div className="profile-avatar">
                      <img src={user.avatar} alt={user.name} />
                    </div>
                    <div className="profile-details">
                      <h1 className="profile-name">{portfolioData.personalInfo.name}</h1>
                      <p className="profile-title">{portfolioData.academicInfo.degree}</p>
                      <p className="profile-university">{portfolioData.academicInfo.university}</p>
                      <div className="profile-stats">
                        <div className="stat">
                          <span className="stat-label">GPA</span>
                          <span className="stat-value">{portfolioData.academicInfo.gpa}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Graduation</span>
                          <span className="stat-value">{portfolioData.academicInfo.graduationYear}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="contact-info">
                    <div className="contact-item">
                      <Mail size={16} />
                      <span>{portfolioData.personalInfo.email}</span>
                    </div>
                    <div className="contact-item">
                      <Phone size={16} />
                      <span>{portfolioData.personalInfo.phone}</span>
                    </div>
                    <div className="contact-item">
                      <MapPin size={16} />
                      <span>{portfolioData.personalInfo.location}</span>
                    </div>
                    <div className="contact-item">
                      <Globe size={16} />
                      <span>{portfolioData.personalInfo.website}</span>
                    </div>
                  </div>

                  <div className="bio-section">
                    <h3>About Me</h3>
                    <p>{portfolioData.personalInfo.bio}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Achievements Section */}
            {selectedSection === 'achievements' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="portfolio-section"
              >
                <div className="section-header">
                  <h2>Achievements & Awards</h2>
                </div>
                
                <div className="achievements-grid">
                  {portfolioData.achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="achievement-card"
                    >
                      <div className="achievement-icon">
                        <Trophy size={24} />
                      </div>
                      <div className="achievement-content">
                        <h3 className="achievement-title">{achievement.title}</h3>
                        <p className="achievement-description">{achievement.description}</p>
                        <div className="achievement-meta">
                          <span className="achievement-date">{achievement.date}</span>
                          <span className="achievement-type">{achievement.type}</span>
                        </div>
                      </div>
                      <div className="achievement-badge">
                        <Check size={16} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Activities Section */}
            {selectedSection === 'activities' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="portfolio-section"
              >
                <div className="section-header">
                  <h2>Academic Activities</h2>
                </div>
                
                <div className="activities-list">
                  {portfolioData.activities.map((activity, index) => {
                    const TypeIcon = getActivityTypeIcon(activity.type);
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="activity-card"
                      >
                        <div 
                          className="activity-type-icon"
                          style={{ backgroundColor: getActivityTypeColor(activity.type) }}
                        >
                          <TypeIcon size={20} />
                        </div>
                        <div className="activity-content">
                          <div className="activity-header">
                            <h3 className="activity-title">{activity.title}</h3>
                            <div className="activity-credits">{activity.credits} credits</div>
                          </div>
                          <p className="activity-organization">{activity.organization}</p>
                          <p className="activity-description">{activity.description}</p>
                          <div className="activity-meta">
                            <div className="activity-date">
                              <Calendar size={14} />
                              <span>{new Date(activity.date).toLocaleDateString()}</span>
                            </div>
                            <div className="activity-status">
                              <Check size={14} />
                              <span>Verified</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Projects Section */}
            {selectedSection === 'projects' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="portfolio-section"
              >
                <div className="section-header">
                  <h2>Projects</h2>
                </div>
                
                <div className="projects-grid">
                  {portfolioData.projects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="project-card"
                    >
                      <div className="project-header">
                        <h3 className="project-title">{project.title}</h3>
                        <span className={`project-status ${project.status}`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="project-description">{project.description}</p>
                      <div className="project-technologies">
                        {project.technologies.map((tech, techIndex) => (
                          <span key={techIndex} className="tech-tag">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className="project-links">
                        <a href={project.github} target="_blank" rel="noopener noreferrer" className="project-link">
                          <Globe size={16} />
                          GitHub
                        </a>
                        <a href={project.demo} target="_blank" rel="noopener noreferrer" className="project-link">
                          <ExternalLink size={16} />
                          Demo
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Skills Section */}
            {selectedSection === 'skills' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="portfolio-section"
              >
                <div className="section-header">
                  <h2>Skills</h2>
                </div>
                
                <div className="skills-content">
                  <div className="skills-category">
                    <h3>Technical Skills</h3>
                    <div className="skills-list">
                      {portfolioData.skills.technical.map((skill, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 * index }}
                          className="skill-tag technical"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="skills-category">
                    <h3>Soft Skills</h3>
                    <div className="skills-list">
                      {portfolioData.skills.soft.map((skill, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 * index }}
                          className="skill-tag soft"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Share Link Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="share-info"
        >
          <div className="share-card">
            <Share2 size={24} className="share-icon" />
            <div className="share-content">
              <h3>Share Your Portfolio</h3>
              <p>Your portfolio is publicly accessible at:</p>
              <div className="share-link">
                <code>{shareLink}</code>
                <button onClick={copyShareLink} className="copy-link-btn">
                  {linkCopied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .digital-portfolio {
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
          gap: 1rem;
        }

        .share-btn,
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

        .share-btn:hover,
        .export-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .export-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .portfolio-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
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

        .portfolio-nav {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .nav-item {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nav-item:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        .nav-item.active {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .portfolio-content {
          margin-bottom: 2rem;
        }

        .portfolio-document {
          background: white;
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          min-height: 800px;
        }

        .portfolio-section {
          max-width: 800px;
          margin: 0 auto;
        }

        .section-header {
          margin-bottom: 2rem;
          text-align: center;
        }

        .section-header h2 {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .personal-info {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .profile-section {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          color: white;
        }

        .profile-avatar img {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 4px solid rgba(255, 255, 255, 0.3);
        }

        .profile-details {
          flex: 1;
        }

        .profile-name {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .profile-title {
          font-size: 1.25rem;
          opacity: 0.9;
          margin-bottom: 0.25rem;
        }

        .profile-university {
          font-size: 1rem;
          opacity: 0.8;
          margin-bottom: 1rem;
        }

        .profile-stats {
          display: flex;
          gap: 2rem;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-label {
          font-size: 0.875rem;
          opacity: 0.8;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .contact-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 12px;
          color: #374151;
        }

        .bio-section {
          padding: 2rem;
          background: #f9fafb;
          border-radius: 16px;
        }

        .bio-section h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .bio-section p {
          color: #6b7280;
          line-height: 1.6;
          font-size: 1.1rem;
        }

        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .achievement-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 16px;
          border-left: 4px solid #10b981;
          position: relative;
        }

        .achievement-icon {
          width: 50px;
          height: 50px;
          background: #10b981;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .achievement-content {
          flex: 1;
        }

        .achievement-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .achievement-description {
          color: #6b7280;
          margin-bottom: 0.75rem;
        }

        .achievement-meta {
          display: flex;
          gap: 1rem;
        }

        .achievement-date,
        .achievement-type {
          font-size: 0.875rem;
          color: #9ca3af;
        }

        .achievement-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          color: #10b981;
        }

        .activities-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .activity-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 16px;
          border-left: 4px solid #667eea;
        }

        .activity-type-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .activity-content {
          flex: 1;
        }

        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .activity-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }

        .activity-credits {
          background: #667eea;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .activity-organization {
          color: #6b7280;
          font-weight: 500;
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
        }

        .activity-date,
        .activity-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .activity-status {
          color: #10b981;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .project-card {
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
        }

        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .project-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }

        .project-status {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .project-status.completed {
          background: #d1fae5;
          color: #065f46;
        }

        .project-status.in-progress {
          background: #fef3c7;
          color: #92400e;
        }

        .project-description {
          color: #6b7280;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .project-technologies {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .tech-tag {
          background: #667eea;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .project-links {
          display: flex;
          gap: 1rem;
        }

        .project-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .project-link:hover {
          color: #5a67d8;
        }

        .skills-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .skills-category h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .skill-tag {
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .skill-tag.technical {
          background: #667eea;
          color: white;
        }

        .skill-tag.soft {
          background: #f3f4f6;
          color: #374151;
          border: 2px solid #e5e7eb;
        }

        .share-info {
          margin-top: 2rem;
        }

        .share-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .share-icon {
          color: #667eea;
        }

        .share-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .share-content p {
          color: #6b7280;
          margin-bottom: 1rem;
        }

        .share-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #f9fafb;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .share-link code {
          flex: 1;
          color: #374151;
          font-family: 'Monaco', 'Menlo', monospace;
        }

        .copy-link-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .copy-link-btn:hover {
          background: #5a67d8;
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

          .portfolio-nav {
            flex-wrap: wrap;
          }

          .portfolio-document {
            padding: 2rem 1.5rem;
          }

          .profile-section {
            flex-direction: column;
            text-align: center;
          }

          .profile-stats {
            justify-content: center;
          }

          .contact-info {
            grid-template-columns: 1fr;
          }

          .achievements-grid,
          .projects-grid {
            grid-template-columns: 1fr;
          }

          .activity-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .share-card {
            flex-direction: column;
            text-align: center;
          }

          .share-link {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DigitalPortfolio;
