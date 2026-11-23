
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },

  applicantName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  coverLetter: {
    type: String,
    default: ''
  },

  status: {
    type: String,
    enum: ['Pending', 'Shortlisted', 'Rejected'],
    default: 'Pending'
  },

  appliedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Application', applicationSchema);
