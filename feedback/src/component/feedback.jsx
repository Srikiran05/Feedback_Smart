import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Coffee, X } from 'lucide-react';
import axios from 'axios';

const FeedbackForm = () => {
    const params = useParams();
    const { tableId } = params;
    const navigate = useNavigate();

    useEffect(() => {
        console.log('All URL Params:', params);
        console.log('Table ID:', tableId);
        console.log('Current URL:', window.location.pathname);
    }, [params, tableId]);

    const [formData, setFormData] = useState({
        comment: '',
        categories: [],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!tableId) {
            setErrorMessage('Table ID is missing. Redirecting to homepage...');
            console.log('No Table ID, redirecting...');
            setTimeout(() => {
                navigate('/');
            }, 2000);
        }
    }, [tableId, navigate]);

    const categories = ['Ambiance', 'Cleanliness', 'Taste', 'Service', 'Value for Money'];
    const sentiments = ['Worst', 'Average', 'Excellent'];

    const categoryToService = {
        'Ambiance': 'ambience',
        'Cleanliness': 'cleanliness',
        'Taste': 'taste',
        'Service': 'service',
        'Value for Money': 'value',
    };

    const handleAddCategory = () => {
        if (formData.categories.length < 3) {
            setFormData({
                ...formData,
                categories: [...formData.categories, { category: '', sentiment: '' }],
            });
        }
    };

    const handleCategoryChange = (index, field, value) => {
        const updatedCategories = [...formData.categories];
        updatedCategories[index] = { ...updatedCategories[index], [field]: value };
        setFormData({ ...formData, categories: updatedCategories });
    };

    const handleRemoveCategory = (index) => {
        const updatedCategories = formData.categories.filter((_, i) => i !== index);
        setFormData({ ...formData, categories: updatedCategories });
    };

    const sentimentToRating = (sentiment) => {
        switch (sentiment) {
            case 'Worst': return 1;
            case 'Average': return 2;
            case 'Excellent': return 3;
            default: throw new Error(`Invalid sentiment: ${sentiment}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        if (!tableId || !formData.comment.trim()) {
            setErrorMessage('Missing Table ID or Feedback.');
            setIsSubmitting(false);
            return;
        }

        let ratings;
        try {
            ratings = formData.categories.map(({ category, sentiment }) => ({
                service: categoryToService[category],
                rating: sentimentToRating(sentiment),
            }));
        } catch {
            setErrorMessage('Invalid sentiment or category.');
            setIsSubmitting(false);
            return;
        }

        const payload = {
            tableName: tableId,
            ratings,
            feedback: formData.comment.trim(),
        };

        try {
            console.log('Submitting feedback:', payload);
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/feedback`, payload, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000,
            });
            console.log('Response:', response.data);
            if (response.status === 201) {
                setIsSubmitted(true);
            }
        } catch (error) {
            console.error('Submission error:', error.response?.data || error.message);
            if (error.code === 'ECONNABORTED') {
                setErrorMessage('Request timed out. Please check your network connection and try again.');
            } else {
                setErrorMessage(error.response?.data?.error || 'Failed to submit feedback. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = () => {
        return formData.categories.every((item) => item.category && item.sentiment);
    };

    if (!tableId) {
        return (
            <div className="container" style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
                <h2>Error: No Matching Route or Table ID</h2>
                <p>Current URL: {window.location.pathname}</p>
                <p>URL Parameters: {JSON.stringify(params)}</p>
                <p>Redirecting to homepage in 2 seconds...</p>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="container" style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem' }}>
                <div className="card fade-in" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', color: 'var(--success-green)', marginBottom: '1rem' }}>✓</div>
                    <h2>Thank You!</h2>
                    <p>Your feedback has been submitted successfully.</p>
                    <div style={{ marginTop: '2rem' }}>
                        <Coffee size={40} style={{ color: 'var(--coffee-brown)' }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem' }}>
            <div className="card slide-up">
                <div className="card-header" style={{ textAlign: 'center' }}>
                    <Coffee size={48} style={{ color: 'var(--coffee-brown)', marginBottom: '1rem' }} />
                    <h1>Share Your Experience</h1>
                    <p>Table #{tableId} - Your feedback helps us serve you better!</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {errorMessage && (
                        <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
                            {errorMessage}
                        </div>
                    )}
                    <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                        <label className="form-label">Your Feedback</label>
                        <textarea
                            className="form-input"
                            value={formData.comment}
                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                            placeholder="Tell us more about your experience..."
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                        <label className="form-label" style={{ marginBottom: '1.5rem' }}>
                            Categories and Sentiments *
                        </label>
                        {formData.categories.map((item, index) => (
                            <div key={index} className="keyword-section" style={{ marginBottom: '2.5rem' }}>
                                <select
                                    className="form-input"
                                    value={item.category}
                                    onChange={(e) => handleCategoryChange(index, 'category', e.target.value)}
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="form-input"
                                    value={item.sentiment}
                                    onChange={(e) => handleCategoryChange(index, 'sentiment', e.target.value)}
                                    required
                                >
                                    <option value="">Select sentiment</option>
                                    {sentiments.map((sentiment) => (
                                        <option key={sentiment} value={sentiment}>
                                            {sentiment}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => handleRemoveCategory(index)}
                                >
                                    <X size={16} style={{ marginRight: '0.3rem' }} />
                                    REMOVE
                                </button>
                            </div>
                        ))}
                        {formData.categories.length < 3 && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleAddCategory}
                                style={{ marginTop: '2rem' }}
                            >
                                Add Category
                            </button>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!isFormValid() || !formData.comment.trim() || isSubmitting}
                        style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="spinner" style={{ width: '20px', height: '20px', marginRight: '0.5rem' }}></div>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send size={20} /> Submit Feedback
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FeedbackForm;