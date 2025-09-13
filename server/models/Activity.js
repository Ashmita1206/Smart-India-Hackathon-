const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['certification', 'conference', 'research', 'volunteering', 'competition', 'internship'],
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  organization: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  files: [{
    name: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  verifiedAt: {
    type: Date
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: {
    type: Date
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
activitySchema.index({ student: 1, status: 1 });
activitySchema.index({ type: 1, status: 1 });
activitySchema.index({ submittedAt: -1 });
activitySchema.index({ studentId: 1 });

// Virtual for activity URL
activitySchema.virtual('activityUrl').get(function() {
  return `/activities/${this._id}`;
});

// Method to update status
activitySchema.methods.updateStatus = function(status, userId, reason = null) {
  this.status = status;
  
  if (status === 'verified') {
    this.verifiedAt = new Date();
    this.verifiedBy = userId;
  } else if (status === 'rejected') {
    this.rejectedAt = new Date();
    this.rejectedBy = userId;
    this.rejectionReason = reason;
  }
  
  return this.save();
};

// Static method to get activities by student
activitySchema.statics.getByStudent = function(studentId, status = null) {
  const query = { studentId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('student', 'name email department')
    .populate('verifiedBy', 'name')
    .populate('rejectedBy', 'name')
    .sort({ submittedAt: -1 });
};

// Static method to get pending activities
activitySchema.statics.getPending = function() {
  return this.find({ status: 'pending' })
    .populate('student', 'name email department studentId')
    .sort({ submittedAt: 1 });
};

// Transform JSON output
activitySchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Activity', activitySchema);
