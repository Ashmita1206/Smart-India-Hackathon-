import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Activity, 
  Users, 
  FileText, 
  BarChart3, 
  LogOut, 
  Menu, 
  X,
  Bell,
  User
} from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { path: '/', icon: Home, label: 'Dashboard', roles: ['student', 'faculty'] },
    { path: '/activities', icon: Activity, label: 'Activities', roles: ['student', 'faculty'] },
    { path: '/faculty', icon: Users, label: 'Faculty Panel', roles: ['faculty'] },
    { path: '/portfolio', icon: FileText, label: 'Portfolio', roles: ['student'] },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['faculty'] }
  ].filter(item => item.roles.includes(user.role));

  const handleLogout = () => {
    onLogout();
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="navbar"
    >
      <div className="navbar-container">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="navbar-brand"
        >
          <div className="brand-logo">
            <Activity size={24} />
          </div>
          <span className="brand-text">Smart Student Hub</span>
        </motion.div>

        <div className="navbar-nav">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link
                  to={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="active-indicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="navbar-actions">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="notification-btn"
          >
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </motion.button>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="user-profile"
          >
            <img src={user.avatar} alt={user.name} className="user-avatar" />
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            className="logout-btn"
          >
            <LogOut size={20} />
          </motion.button>

          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: isMobileMenuOpen ? 1 : 0,
          height: isMobileMenuOpen ? 'auto' : 0
        }}
        transition={{ duration: 0.3 }}
        className="mobile-menu"
      >
        <div className="mobile-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </motion.div>

      <style jsx>{`
        .navbar {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .navbar-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 700;
          font-size: 1.25rem;
          color: #1f2937;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          color: white;
        }

        .brand-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .navbar-nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          color: #6b7280;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
        }

        .nav-link:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .nav-link.active {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .active-indicator {
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background: #667eea;
          border-radius: 50%;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .notification-btn {
          position: relative;
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .notification-btn:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .notification-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: #ef4444;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.125rem 0.375rem;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .user-profile:hover {
          background: rgba(102, 126, 234, 0.1);
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 600;
          color: #1f2937;
          font-size: 0.875rem;
        }

        .user-role {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: capitalize;
        }

        .logout-btn {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
        }

        .mobile-menu {
          overflow: hidden;
          background: rgba(255, 255, 255, 0.98);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .mobile-nav {
          padding: 1rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          color: #6b7280;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .mobile-nav-link:hover,
        .mobile-nav-link.active {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        @media (max-width: 768px) {
          .navbar-container {
            padding: 0 1rem;
          }

          .navbar-nav {
            display: none;
          }

          .user-info {
            display: none;
          }

          .mobile-menu-btn {
            display: block;
          }

          .brand-text {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .navbar-actions {
            gap: 0.5rem;
          }

          .notification-btn {
            display: none;
          }
        }
      `}</style>
    </motion.nav>
  );
};

export default Navbar;
