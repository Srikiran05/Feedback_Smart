const Feedback = require('./schemas');
const axios = require('axios');

// Ollama API interaction
async function analyzeFeedback(feedback, ratings) {
    try {
        const prompt = `
You are an AI tasked with analyzing customer feedback and ratings for a service. 
Given the following:
- Feedback: "${feedback}"
- Ratings: ${JSON.stringify(ratings)}

Provide a response in JSON format with the following structure:
{
  "sentiment": "positive/neutral/negative",
  "summary": "A concise summary of the feedback",
  "actionableInsights": ["Insight 1", "Insight 2", ...]
}

The actionable insights should be specific, quantifiable suggestions based on the feedback text and ratings, e.g., "20% want quieter music", "35% recommend more vegan options".
Ensure the response is valid JSON without Markdown formatting (e.g., no \`\`\`json markers).
`;

        const response = await axios.post('http://localhost:11434/api/generate', {
            model: 'llama3.2:1b',
            prompt: prompt,
            stream: false,
        });

        // Log raw response for debugging
        console.log('Ollama raw response:', response.data.response);

        // Strip Markdown and whitespace
        let jsonString = response.data.response;
        jsonString = jsonString.replace(/```json\n?/, '').replace(/```\n?/, '').trim();

        // Parse JSON
        const parsedResponse = JSON.parse(jsonString);
        console.log('Parsed Ollama response:', parsedResponse);

        return parsedResponse;
    } catch (error) {
        console.error('Error analyzing feedback with Ollama:', error.message, error.stack);
        return {
            sentiment: 'neutral',
            summary: 'Unable to analyze feedback due to an error.',
            actionableInsights: [],
        };
    }
}

// Submit feedback
exports.submitFeedback = async (req, res) => {
    const { tableName, ratings, feedback } = req.body;

    // Log received payload
    console.log('Received feedback payload:', req.body);

    // Validate input
    if (!tableName || !ratings || !feedback) {
        console.log('Validation failed: Missing required fields');
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (
        !Array.isArray(ratings) ||
        !ratings.every(r =>
            typeof r === 'object' &&
            typeof r.service === 'string' &&
            ['ambience', 'cleanliness', 'taste', 'service', 'value'].includes(r.service) &&
            typeof r.rating === 'number' &&
            [1, 2, 3].includes(r.rating)
        )
    ) {
        console.log('Validation failed: Invalid ratings format', ratings);
        return res.status(400).json({ error: 'Invalid ratings format' });
    }

    try {
        const newFeedback = new Feedback({ tableName, ratings, feedback });
        console.log('Saving feedback to MongoDB:', newFeedback);
        const savedFeedback = await newFeedback.save();
        console.log('Feedback saved successfully, ID:', savedFeedback._id);

        const analysis = await analyzeFeedback(feedback, ratings);

        res.status(201).json({
            message: 'Feedback saved successfully',
            analysis,
            feedbackId: savedFeedback._id,
        });
    } catch (error) {
        console.error('Error processing feedback:', error.message, error.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get feedback analytics (unchanged)
exports.getFeedbackAnalytics = async (req, res) => {
    try {
        const keywords = ['ambience', 'cleanliness', 'taste', 'service', 'value'];

        const feedbackCounts = await Feedback.aggregate([
            { $unwind: '$ratings' },
            {
                $group: {
                    _id: '$ratings.service',
                    count: { $sum: 1 },
                    totalRating: { $sum: '$ratings.rating' }
                }
            }
        ]);

        const totalFeedbacksByCategory = {};
        const totalRatingsByCategory = {};
        keywords.forEach(keyword => {
            const found = feedbackCounts.find(fc => fc._id === keyword);
            totalFeedbacksByCategory[keyword] = found ? found.count : 0;
            totalRatingsByCategory[keyword] = found ? found.totalRating : 0;
        });

        const total_feedbacks = Object.values(totalFeedbacksByCategory).reduce((sum, count) => sum + count, 0);
        const total_ratings_count = Object.values(totalRatingsByCategory).reduce((sum, total) => sum + total, 0);
        const average_rating = total_feedbacks > 0 ? (total_ratings_count / total_feedbacks).toFixed(2) : 0;

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentFeedbacks = await Feedback.find({ createdAt: { $gte: oneDayAgo } });
        const responses_today = recentFeedbacks.length;

        const tableBreakdown = await Feedback.aggregate([
            { $unwind: '$ratings' },
            {
                $group: {
                    _id: { tableName: '$tableName', service: '$ratings.service', rating: '$ratings.rating' },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.tableName',
                    ratings: {
                        $push: {
                            service: '$_id.service',
                            rating: '$_id.rating',
                            count: '$count'
                        }
                    }
                }
            }
        ]);

        const tableData = {};
        tableBreakdown.forEach(table => {
            tableData[table._id] = {};
            keywords.forEach(keyword => {
                tableData[table._id][keyword] = { worst: 0, average: 0, excellent: 0 };
                table.ratings.forEach(r => {
                    if (r.service === keyword) {
                        if (r.rating === 1) tableData[table._id][keyword].worst = r.count;
                        if (r.rating === 2) tableData[table._id][keyword].average = r.count;
                        if (r.rating === 3) tableData[table._id][keyword].excellent = r.count;
                    }
                });
            });
        });

        res.status(200).json({
            total_feedbacks,
            feedback_counts: Object.values(totalFeedbacksByCategory),
            total_ratings: Object.values(totalRatingsByCategory),
            total_ratings_count,
            average_rating,
            responses_today,
            recent_feedbacks: recentFeedbacks,
            table_breakdown: tableData
        });
    } catch (error) {
        console.error('Error fetching analytics:', error.message, error.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
};