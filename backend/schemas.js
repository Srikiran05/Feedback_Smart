const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    tableName: { type: String, required: true },
    ratings: [{
        service: { type: String, required: true, enum: ['ambience', 'cleanliness', 'taste', 'service', 'value'] },
        rating: { type: Number, required: true, min: 1, max: 3 }
    }],
    feedback: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Feedback', feedbackSchema);