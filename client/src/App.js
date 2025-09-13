import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import StudentDashboard from './components/StudentDashboard';
import ActivityTracker from './components/ActivityTracker';
import FacultyPanel from './components/FacultyPanel';
import DigitalPortfolio from './components/DigitalPortfolio';
import AnalyticsReporting from './components/AnalyticsReporting';
import Login from './components/Login';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  if (!user) {
    return <Login onLogin={handleLogin} isLoading={isLoading} setIsLoading={setIsLoading} />;
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        <AnimatePresence mode="wait">
          <Routes>
            <Route 
              path="/" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <StudentDashboard user={user} />
                </motion.div>
              } 
            />
            <Route 
              path="/activities" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <ActivityTracker user={user} />
                </motion.div>
              } 
            />
            <Route 
              path="/faculty" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <FacultyPanel user={user} />
                </motion.div>
              } 
            />
            <Route 
              path="/portfolio" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <DigitalPortfolio user={user} />
                </motion.div>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <AnalyticsReporting user={user} />
                </motion.div>
              } 
            />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;
