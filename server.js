
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Job = require('./models/JobModel');
const Application = require('./models/ApplicationModel');

const app = express();

app.use(cors());
app.use(express.json());

// Test Route
app.get('/', (req, res) => {
  res.send('CareerNest Backend is Running!');
});

// Add New Job
app.post('/api/jobs', async (req, res) => {
  try {
    const newJob = new Job(req.body);
    const savedJob = await newJob.save();

    res.status(201).json({
      message: 'Job added successfully',
      job: savedJob
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error adding job',
      error: error.message
    });
  }
});

// Get All Jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching jobs',
      error: error.message
    });
  }
});

// Submit Job Application
app.post('/api/applications', async (req, res) => {
  try {
    const {
      job,
      applicantName,
      email,
      phone,
      coverLetter
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(job)) {
      return res.status(400).json({
        message: 'Invalid job ID'
      });
    }

    const existingJob = await Job.findById(job);

    if (!existingJob) {
      return res.status(404).json({
        message: 'Job not found'
      });
    }

    const newApplication = new Application({
      job,
      applicantName,
      email,
      phone,
      coverLetter
    });

    const savedApplication = await newApplication.save();

    res.status(201).json({
      message: 'Application submitted successfully!',
      application: savedApplication
    });
  } catch (error) {
    res.status(400).json({
      message: 'Application submission failed',
      error: error.message
    });
  }
});

// Get All Applications
app.get('/api/applications', async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('job', 'title company location')
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching applications',
      error: error.message
    });
  }
});

// Update Application Status
app.patch('/api/applications/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      'Pending',
      'Shortlisted',
      'Rejected'
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid application status'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid application ID'
      });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('job', 'title company location');

    if (!updatedApplication) {
      return res.status(404).json({
        message: 'Application not found'
      });
    }

    res.status(200).json({
      message: 'Application status updated successfully!',
      application: updatedApplication
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error updating application status',
      error: error.message
    });
  }
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');

    app.listen(5000, () => {
      console.log('CareerNest Server running on port 5000');
    });
  })
  .catch((error) => {
    console.log('MongoDB Connection Error:', error.message);
  });
