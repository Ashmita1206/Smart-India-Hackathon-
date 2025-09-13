// Demo data for when MongoDB is not available
const demoUsers = [
  {
    _id: '1',
    name: 'Alex Johnson',
    email: 'student@demo.com',
    role: 'student',
    studentId: 'CS2023001',
    department: 'Computer Science',
    year: 'Senior',
    gpa: 3.8,
    avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=667eea&color=fff'
  },
  {
    _id: '2',
    name: 'Dr. Sarah Wilson',
    email: 'faculty@demo.com',
    role: 'faculty',
    department: 'Faculty of Engineering',
    avatar: 'https://ui-avatars.com/api/?name=Dr.+Sarah+Wilson&background=667eea&color=fff'
  }
];

const demoActivities = [
  {
    _id: '1',
    title: 'Python Programming Certificate',
    type: 'certification',
    studentId: 'CS2023001',
    studentName: 'Alex Johnson',
    studentEmail: 'student@demo.com',
    description: 'Completed Python programming course with distinction',
    organization: 'Python Institute',
    date: '2024-01-15',
    credits: 3,
    status: 'verified',
    submittedAt: '2024-01-16T10:30:00Z',
    verifiedAt: '2024-01-17T10:30:00Z',
    verifiedBy: 'Dr. Sarah Wilson',
    files: [
      { name: 'python_certificate.pdf', type: 'application/pdf' }
    ]
  },
  {
    _id: '2',
    title: 'Tech Conference 2024',
    type: 'conference',
    studentId: 'CS2023001',
    studentName: 'Alex Johnson',
    studentEmail: 'student@demo.com',
    description: 'Attended annual technology conference and presented research',
    organization: 'Tech Innovation Summit',
    date: '2024-01-10',
    credits: 2,
    status: 'verified',
    submittedAt: '2024-01-11T14:20:00Z',
    verifiedAt: '2024-01-12T14:20:00Z',
    verifiedBy: 'Dr. Sarah Wilson',
    files: [
      { name: 'conference_badge.jpg', type: 'image/jpeg' },
      { name: 'presentation_slides.pdf', type: 'application/pdf' }
    ]
  },
  {
    _id: '3',
    title: 'Community Service Project',
    type: 'volunteering',
    studentId: 'CS2023001',
    studentName: 'Alex Johnson',
    studentEmail: 'student@demo.com',
    description: 'Organized food drive for local community center',
    organization: 'Local Community Center',
    date: '2024-01-08',
    credits: 1,
    status: 'pending',
    submittedAt: '2024-01-09T09:15:00Z',
    files: [
      { name: 'volunteer_certificate.pdf', type: 'application/pdf' }
    ]
  },
  {
    _id: '4',
    title: 'Research Paper Publication',
    type: 'research',
    studentId: 'CS2023001',
    studentName: 'Alex Johnson',
    studentEmail: 'student@demo.com',
    description: 'Published research paper in IEEE conference',
    organization: 'IEEE Computer Society',
    date: '2024-01-05',
    credits: 5,
    status: 'verified',
    submittedAt: '2024-01-06T16:45:00Z',
    verifiedAt: '2024-01-07T10:30:00Z',
    verifiedBy: 'Dr. Sarah Wilson',
    files: [
      { name: 'research_paper.pdf', type: 'application/pdf' }
    ]
  }
];

// In-memory database simulation
class DemoDatabase {
  constructor() {
    this.users = [...demoUsers];
    this.activities = [...demoActivities];
    this.nextUserId = 3;
    this.nextActivityId = 5;
  }

  // User methods
  findUser(query) {
    if (query.email && query.role) {
      return this.users.find(user => user.email === query.email && user.role === query.role);
    }
    if (query._id) {
      return this.users.find(user => user._id === query._id);
    }
    if (query.studentId) {
      return this.users.find(user => user.studentId === query.studentId);
    }
    return null;
  }

  createUser(userData) {
    const user = {
      _id: this.nextUserId.toString(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.push(user);
    this.nextUserId++;
    return user;
  }

  updateUser(id, updateData) {
    const userIndex = this.users.findIndex(user => user._id === id);
    if (userIndex !== -1) {
      this.users[userIndex] = {
        ...this.users[userIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      return this.users[userIndex];
    }
    return null;
  }

  // Activity methods
  findActivities(query = {}) {
    let filtered = [...this.activities];
    
    if (query.studentId) {
      filtered = filtered.filter(activity => activity.studentId === query.studentId);
    }
    if (query.status) {
      filtered = filtered.filter(activity => activity.status === query.status);
    }
    if (query.type) {
      filtered = filtered.filter(activity => activity.type === query.type);
    }
    
    return filtered;
  }

  findActivityById(id) {
    return this.activities.find(activity => activity._id === id);
  }

  createActivity(activityData) {
    const activity = {
      _id: this.nextActivityId.toString(),
      ...activityData,
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.activities.push(activity);
    this.nextActivityId++;
    return activity;
  }

  updateActivity(id, updateData) {
    const activityIndex = this.activities.findIndex(activity => activity._id === id);
    if (activityIndex !== -1) {
      this.activities[activityIndex] = {
        ...this.activities[activityIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      return this.activities[activityIndex];
    }
    return null;
  }

  deleteActivity(id) {
    const activityIndex = this.activities.findIndex(activity => activity._id === id);
    if (activityIndex !== -1) {
      return this.activities.splice(activityIndex, 1)[0];
    }
    return null;
  }

  // Analytics methods
  getStats() {
    const totalStudents = this.users.filter(user => user.role === 'student').length;
    const totalActivities = this.activities.length;
    const verifiedActivities = this.activities.filter(activity => activity.status === 'verified').length;
    const pendingActivities = this.activities.filter(activity => activity.status === 'pending').length;
    const totalCredits = this.activities
      .filter(activity => activity.status === 'verified')
      .reduce((sum, activity) => sum + activity.credits, 0);

    return {
      totalStudents,
      totalActivities,
      verifiedActivities,
      pendingActivities,
      totalCredits,
      averageGPA: 3.4,
      completionRate: 84.5
    };
  }
}

// Create global demo database instance
const demoDB = new DemoDatabase();

module.exports = demoDB;
