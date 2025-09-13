# Smart Student Hub 🎓

A comprehensive student activity tracking platform with modern animations, faculty validation, and digital portfolio generation.

## ✨ Key Features

### 🎯 Dynamic Student Dashboard
- Real-time academic progress tracking
- Activity statistics and achievements
- Interactive charts and visualizations
- Quick snapshot of verified activities

### 📋 Activity Tracker
- Upload certificates, achievements, and event details
- Drag & drop file upload with preview
- Faculty validation system with status tracking
- Multiple activity types (certifications, conferences, research, volunteering, competitions, internships)

### 👨‍🏫 Faculty/Admin Panel
- Approve/reject student uploads with comments
- Bulk approval/rejection capabilities
- Generate departmental reports instantly
- Student management and analytics

### 📄 Digital Portfolio
- Auto-exported PDF generation
- Unique shareable links for each student
- Professional portfolio layout
- Perfect for placements, higher studies, and scholarships

### 📊 Analytics & Reporting
- Custom reports with multiple filters
- Department-wise performance metrics
- Activity type distribution analysis
- Institutional dashboard for accreditation
- Top performer rankings

### 🔗 Integrations Ready
- RESTful API architecture
- MongoDB database with Mongoose ODM
- JWT authentication system
- File upload with Multer
- Ready for ERP/LMS integration

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-student-hub
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cd server
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Demo Credentials

**Student Login:**
- Email: `student@demo.com`
- Password: `password123`

**Faculty Login:**
- Email: `faculty@demo.com`
- Password: `password123`

## 🏗️ Project Structure

```
smart-student-hub/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Login.js
│   │   │   ├── Navbar.js
│   │   │   ├── StudentDashboard.js
│   │   │   ├── ActivityTracker.js
│   │   │   ├── FacultyPanel.js
│   │   │   ├── DigitalPortfolio.js
│   │   │   └── AnalyticsReporting.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   │   ├── User.js
│   │   └── Activity.js
│   ├── routes/            # API routes
│   │   ├── auth.js
│   │   ├── students.js
│   │   ├── activities.js
│   │   ├── faculty.js
│   │   └── analytics.js
│   ├── middleware/        # Custom middleware
│   │   └── auth.js
│   ├── index.js
│   └── package.json
└── README.md
```

## 🎨 Frontend Features

### Modern UI/UX
- **Glass morphism design** with backdrop blur effects
- **Smooth animations** using Framer Motion
- **Responsive design** for all device sizes
- **Interactive charts** with Recharts library
- **File upload** with drag & drop support

### Component Highlights
- **StudentDashboard**: Progress tracking with animated charts
- **ActivityTracker**: File upload with real-time validation
- **FacultyPanel**: Bulk operations and detailed analytics
- **DigitalPortfolio**: PDF export with professional layout
- **AnalyticsReporting**: Comprehensive institutional insights

## 🔧 Backend Features

### API Endpoints
- **Authentication**: JWT-based auth with role management
- **Activities**: CRUD operations with file handling
- **Faculty**: Approval workflows and bulk operations
- **Analytics**: Real-time statistics and reporting
- **Students**: Profile management and progress tracking

### Database Models
- **User**: Student/faculty profiles with role-based access
- **Activity**: Comprehensive activity tracking with file attachments

### Security Features
- **Helmet.js** for security headers
- **Rate limiting** to prevent abuse
- **Input validation** and sanitization
- **File type restrictions** and size limits
- **CORS** configuration for cross-origin requests

## 📱 Mobile Responsive

The platform is fully responsive and works seamlessly on:
- 📱 Mobile phones (iOS/Android)
- 📱 Tablets (iPad/Android tablets)
- 💻 Desktop computers
- 🖥️ Large screens

## 🎯 Use Cases

### For Students
- Track academic and extracurricular activities
- Build comprehensive digital portfolios
- Monitor progress toward graduation requirements
- Generate professional profiles for job applications

### For Faculty
- Validate and approve student activities
- Generate departmental reports
- Monitor student engagement
- Track institutional metrics

### For Administrators
- Institutional analytics and reporting
- Accreditation compliance tracking
- Performance benchmarking
- Resource allocation insights

## 🔮 Future Enhancements

- [ ] **Mobile App** (React Native)
- [ ] **Real-time Notifications** (WebSocket)
- [ ] **Advanced Analytics** (Machine Learning)
- [ ] **Integration APIs** (ERP/LMS systems)
- [ ] **Blockchain Verification** for certificates
- [ ] **AI-powered** activity recommendations
- [ ] **Multi-language** support
- [ ] **Advanced Reporting** with custom templates

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **Framer Motion** - Smooth animations
- **Recharts** - Interactive charts
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Dropzone** - File uploads
- **jsPDF** - PDF generation
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File upload handling
- **Bcrypt** - Password hashing
- **Helmet** - Security middleware

## 📄 API Documentation

### Authentication Endpoints
```
POST /api/auth/register    # Register new user
POST /api/auth/login       # User login
GET  /api/auth/me          # Get current user
PUT  /api/auth/profile     # Update profile
```

### Activity Endpoints
```
GET    /api/activities/student/:studentId  # Get student activities
POST   /api/activities                     # Create new activity
PUT    /api/activities/:id                 # Update activity
DELETE /api/activities/:id                 # Delete activity
```

### Faculty Endpoints
```
GET  /api/faculty/pending              # Get pending activities
PUT  /api/faculty/activities/:id/approve  # Approve activity
PUT  /api/faculty/activities/:id/reject   # Reject activity
GET  /api/faculty/students              # Get students list
```

### Analytics Endpoints
```
GET /api/analytics/overview      # Get overview statistics
GET /api/analytics/trends        # Get activity trends
GET /api/analytics/departments   # Get department performance
GET /api/analytics/report        # Generate comprehensive report
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Framer Motion** for smooth animations
- **Recharts** for beautiful charts
- **Lucide** for consistent icons
- **MongoDB** for flexible data storage
- **Express.js** for robust API development

## 📞 Support

For support, email support@smartstudenthub.com or create an issue in the repository.

---

**Built with ❤️ for educational institutions worldwide**
