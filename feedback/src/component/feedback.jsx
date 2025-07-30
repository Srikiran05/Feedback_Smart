import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const categories = ['ambience', 'cleanliness', 'taste', 'service', 'value'];
const sentiments = ['Worst', 'Average', 'Excellent'];

const Feedback = () => {
    const { id } = useParams(); // Get table ID from URL
    const [feedback, setFeedback] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    // Handle rating selection
    const handleRatingChange = (category, rating) => {
        setFeedback((prev) => ({
            ...prev,
            [category]: rating,
        }));
    };

    // Submit feedback
    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            table_id: id,
            ...feedback,
        };

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/feedback`, payload);
            setSubmitted(true);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to submit feedback. Please try again later.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
            <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl">
                <h2 className="text-2xl font-bold text-center mb-4">Feedback for Table {id}</h2>

                {submitted ? (
                    <div className="text-green-600 text-center font-medium text-lg">
                        Thank you! Your feedback has been submitted.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {categories.map((category) => (
                            <div key={category}>
                                <label className="block font-semibold mb-2 capitalize">{category}</label>
                                <div className="flex gap-4">
                                    {sentiments.map((sentiment, index) => (
                                        <label key={sentiment} className="flex items-center space-x-1">
                                            <input
                                                type="radio"
                                                name={category}
                                                value={index}
                                                checked={feedback[category] === index}
                                                onChange={() => handleRatingChange(category, index)}
                                                required
                                            />
                                            <span>{sentiment}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {error && <div className="text-red-600 text-sm">{error}</div>}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                        >
                            Submit Feedback
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Feedback;
