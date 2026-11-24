
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
  res.send('CareerNest Server is Running!');
});

// POST - Create Job
app.post('/api/jobs', async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();

    res.status(201).json({
      message: 'Job posted successfully',
      job
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - All Jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Apply for Job
app.post('/api/applications', async (req, res) => {
  try {
    const application = new Application(req.body);
    await application.save();

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - All Applications
app.get('/api/applications', async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('job', 'title company location')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH - Update Application Status
app.patch('/api/applications/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['Pending', 'Shortlisted', 'Rejected'];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid application ID'
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid application status'
      });
    }

    const application = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('job', 'title company location');

    if (!application) {
      return res.status(404).json({
        message: 'Application not found'
      });
    }

    res.json({
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Render Port
const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');

    app.listen(PORT, () => {
      console.log(`CareerNest Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log('MongoDB Connection Error:', error.message);
  });
