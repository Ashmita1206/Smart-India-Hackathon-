const express = require('express');
const jwt = require('jsonwebtoken');
const demoDB = require('../demo-data');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, year } = req.body;

    // Check if user already exists
    const existingUser = demoDB.findUser({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = demoDB.createUser({
      name,
      email,
      password, // In demo mode, we don't hash passwords
      role: role || 'student',
      department,
      year: year || 'Freshman'
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Find user
    const user = demoDB.findUser({ email, role });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // In demo mode, accept any password
    if (password !== 'password123') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date().toISOString();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        avatar: user.avatar,
        year: user.year,
        gpa: user.gpa
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', (req, res) => {
  try {
    const user = demoDB.findUser({ _id: req.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', (req, res) => {
  try {
    const { name, department, year, gpa, preferences } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (department) updateData.department = department;
    if (year) updateData.year = year;
    if (gpa !== undefined) updateData.gpa = gpa;
    if (preferences) updateData.preferences = preferences;

    const user = demoDB.updateUser(req.userId, updateData);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// Change password
router.put('/password', (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = demoDB.findUser({ _id: req.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // In demo mode, accept any current password
    if (currentPassword !== 'password123') {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;
