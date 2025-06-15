const express = require('express');
const router = express.Router();
const { submitFeedback, getFeedbackAnalytics } = require('./controllers');

router.post('/feedback', submitFeedback);
router.get('/analytics', getFeedbackAnalytics);

module.exports = router;