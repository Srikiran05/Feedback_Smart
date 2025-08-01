const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const feedbackRoutes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURL = process.env.MONGODB_URL || 'mongodb+srv://<username>:<password>@cluster0.wbkiev2.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define Feedback model
const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', new mongoose.Schema({
    tableName: String,
    ratings: [{ service: String, rating: Number }],
    feedback: String,
    averageRating: Number,
    timestamp: { type: Date, default: Date.now },
}));

// Static table list
const TABLES = [
    { id: '1', location: 'Window Side', capacity: 4 },
    { id: '2', location: 'Center', capacity: 2 },
    { id: '3', location: 'Corner', capacity: 6 },
    { id: '4', location: 'Patio', capacity: 4 },
    { id: '5', location: 'Bar Counter', capacity: 8 },
    { id: '6', location: 'Outdoor', capacity: 6 },
];

// Real-time route to get table data
app.get('/api/tables', async (req, res) => {
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

// Add route to handle feedback submission
app.post('/api/feedback', async (req, res) => {
    try {
        const { tableName, ratings, feedback } = req.body;

        // Validate payload
        if (!tableName || !feedback || !Array.isArray(ratings) || ratings.length === 0) {
            return res.status(400).json({ error: 'tableName, feedback, and at least one rating are required' });
        }

        // Calculate average rating from the ratings array
        const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

        // Create new feedback entry
        const newFeedback = new Feedback({
            tableName,
            ratings,
            feedback,
            averageRating,
        });

        console.log('Saving feedback to MongoDB:', newFeedback);
        await newFeedback.save();
        console.log('Feedback saved successfully');
        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (err) {
        console.error('Feedback submission error:', err);
        res.status(500).json({ error: 'Failed to save feedback' });
    }
});

// Add analytics route
app.get('/api/analytics', async (req, res) => {
    try {
        const allFeedbacks = await Feedback.find();
        const totalFeedbacks = allFeedbacks.length;
        const avgRating = totalFeedbacks > 0
            ? allFeedbacks.reduce((sum, f) => sum + (f.averageRating || 0), 0) / totalFeedbacks
            : 0;
        const responsesToday = await Feedback.countDocuments({
            timestamp: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lte: new Date(new Date().setHours(23, 59, 59, 999)),
            },
        });

        res.json({
            total_feedbacks: totalFeedbacks,
            average_rating: parseFloat(avgRating.toFixed(1)),
            responses_today: responsesToday,
        });
    } catch (err) {
        console.error('Error fetching analytics:', err);
        res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
});

// Other feedback routes (if defined in routes/)
app.use('/api', feedbackRoutes);

// Start server with dynamic port for Render.com
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
}).on('error', (err) => {
    console.error('Server startup error:', err);
});