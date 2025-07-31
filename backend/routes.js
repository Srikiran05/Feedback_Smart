const express = require('express');
const router = express.Router();
const { submitFeedback, getFeedbackAnalytics } = require('./controllers');
const { Feedback } = require('./schemas');

// Static table list
const TABLES = [
    { id: '1', location: 'Window Side', capacity: 4 },
    { id: '2', location: 'Center', capacity: 2 },
    { id: '3', location: 'Corner', capacity: 6 },
    { id: '4', location: 'Patio', capacity: 4 },
    { id: '5', location: 'Bar Counter', capacity: 8 },
    { id: '6', location: 'Outdoor', capacity: 6 },
];

router.post('/feedback', submitFeedback);

// ✅ Fix: use actual analytics controller and correct route
router.get('/feedback/analytics', getFeedbackAnalytics);

router.get('/tables', async (req, res) => {
    try {
        const results = await Promise.all(TABLES.map(async (table) => {
            const feedbacks = await Feedback.find({ tableName: table.id });
            const feedbackCount = feedbacks.length;
            const avgRating = feedbackCount > 0
                ? feedbacks.reduce((sum, f) => sum + (f.averageRating || 0), 0) / feedbackCount
                : 0;
            return {
                ...table,
                feedbackCount,
                averageRating: parseFloat(avgRating.toFixed(1)),
            };
        }));
        res.json(results);
    } catch (err) {
        console.error('Error fetching tables:', err);
        res.status(500).json({ error: 'Failed to fetch table data' });
    }
});

module.exports = router;
