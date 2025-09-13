import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, User, Lock, Eye, EyeOff } from 'lucide-react';
import API from "../api";

const Login = ({ onLogin, isLoading, setIsLoading }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (errors[name] || errors.general) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
        general: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Call the login API
      const response = await API.post('/auth/login', {
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      // On success, call onLogin with the response data
      onLogin(response.data.user);
      setIsLoading(false);
    } catch (error) {
      // On error, display error message
      setErrors({ general: 'Invalid email or password' });
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="login-card"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="login-header"
        >
          <div className="login-logo">
            <GraduationCap size={48} className="logo-icon" />
          </div>
          <h1 className="login-title">Smart Student Hub</h1>
          <p className="login-subtitle">Your comprehensive activity tracking platform</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleSubmit}
          className="login-form"
        >
          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-input"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty/Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-group">
              <User size={20} className="input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-group">
              <Lock size={20} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {errors.general && <span className="error-message general-error">{errors.general}</span>}

          <motion.button
            type="submit"
            disabled={isLoading}
            className="login-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className="loading-spinner" />
            ) : (
              'Sign In'
            )}
          </motion.button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="login-footer"
        >
          <p className="demo-credentials">
            <strong>Demo Credentials:</strong><br />
            Student: student@demo.com / password123<br />
            Faculty: faculty@demo.com / password123
          </p>
        </motion.div>
      </motion.div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 3rem;
          width: 100%;
          max-width: 450px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          margin-bottom: 1rem;
        }

        .logo-icon {
          color: white;
        }

        .login-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .login-subtitle {
          color: #6b7280;
          font-size: 1rem;
        }

        .login-form {
          margin-bottom: 2rem;
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

        .input-group {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: #9ca3af;
          z-index: 1;
        }

        .form-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.9);
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input.error {
          border-color: #ef4444;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 0.25rem;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          display: block;
        }

        .general-error {
          text-align: center;
          margin-bottom: 1rem;
          background: rgba(239, 68, 68, 0.1);
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .login-button {
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          padding: 1rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-footer {
          text-align: center;
        }

        .demo-credentials {
          background: rgba(102, 126, 234, 0.1);
          padding: 1rem;
          border-radius: 12px;
          font-size: 0.875rem;
          color: #4b5563;
          line-height: 1.5;
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 1rem;
          }
          
          .login-card {
            padding: 2rem;
          }
          
          .login-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
