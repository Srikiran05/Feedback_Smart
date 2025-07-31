import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Coffee, MessageSquare, Star, Users } from 'lucide-react';
import axios from 'axios';
import Sidebar from './Sidebar';
import { CATEGORY, SENTIMENT_STRING } from '../constants';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_feedbacks: 0,
        average_rating: 0,
        responses_today: 0,
    });

    const [categoryFeedbackData, setCategoryFeedbackData] = useState([]);
    const [categoryMetricData, setCategoryMetricData] = useState([]);
    const [sentimentTableData, setSentimentTableData] = useState({});
    const [actualCategoryMentions, setActualCategoryMentions] = useState({});
    const [bar2YAxisMax, setBar2YAxisMax] = useState(5);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Add these useEffects to log data after state updates
    useEffect(() => {
        console.log('Category Feedback Data updated:', categoryFeedbackData);
    }, [categoryFeedbackData]);

    useEffect(() => {
        console.log('Category Metric Data updated:', categoryMetricData);
    }, [categoryMetricData]);

    useEffect(() => {
        console.log('Sentiment Table Data updated:', sentimentTableData);
    }, [sentimentTableData]);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/analytics`);
            console.log('API Response:', response.data);
            const data = response.data;

            const totalFeedbacks = data.total_feedbacks || 0;
            console.log('Total Feedbacks:', totalFeedbacks);
            console.log('Average rating:', average_rating);
            console.log('Total responses:', responses_today);

            setStats({
                total_feedbacks: totalFeedbacks,
                average_rating: parseFloat(data.average_rating) || 0,
                responses_today: data.responses_today || 0,
            });
            // No need to log stats immediately here, useEffect can log if desired

            // Map feedback counts to categoryFeedbackData
            setCategoryFeedbackData(
                CATEGORY.map((cat, index) => ({
                    name: cat.charAt(0).toUpperCase() + cat.slice(1),
                    feedback: data.feedback_counts?.[index] || 0,
                }))
            );

            // Map average ratings per category to categoryMetricData
            setCategoryMetricData(
                CATEGORY.map((cat, index) => ({
                    name: cat.charAt(0).toUpperCase() + cat.slice(1),
                    metric:
                        data.feedback_counts?.[index] > 0
                            ? parseFloat((data.total_ratings?.[index] / data.feedback_counts[index]).toFixed(1))
                            : 0,
                }))
            );

            // Prepare sentiment summary table data
            const sentimentData = {};
            const mentionCounter = {};

            CATEGORY.forEach((cat) => {
                sentimentData[cat] = { worst: 0, average: 0, excellent: 0 };
                mentionCounter[cat] = 0;
            });

            Object.values(data.table_breakdown || {}).forEach((table) => {
                CATEGORY.forEach((cat) => {
                    if (table[cat]) {
                        sentimentData[cat].worst += table[cat].worst || 0;
                        sentimentData[cat].average += table[cat].average || 0;
                        sentimentData[cat].excellent += table[cat].excellent || 0;

                        const totalMentions =
                            (table[cat].worst || 0) +
                            (table[cat].average || 0) +
                            (table[cat].excellent || 0);

                        mentionCounter[cat] += totalMentions;
                    }
                });
            });

            setSentimentTableData(sentimentData);
            setActualCategoryMentions(mentionCounter);

            // Calculate max Y-axis for average rating bar chart
            const bar2Max = Math.max(...CATEGORY.map((cat, index) => {
                if (data.feedback_counts?.[index] > 0) {
                    return parseFloat((data.total_ratings?.[index] / data.feedback_counts[index]).toFixed(1));
                }
                return 0;
            })) + 1;

            setBar2YAxisMax(bar2Max > 5 ? bar2Max : 5); // Minimum range 5
        } catch (error) {
            console.error('Error fetching dashboard data:', error.message, error.stack);
        }
    };

    const sentimentLabels = SENTIMENT_STRING.reduce((acc, sentiment) => {
        acc[sentiment.toLowerCase()] = sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
        return acc;
    }, {});

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="main-content">
                <div className="dashboard-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p>Overview of customer feedback and insights</p>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{stats.total_feedbacks}</div>
                        <div className="stat-label">
                            <MessageSquare size={16} style={{ marginRight: '0.5rem' }} />
                            Total Feedback
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.average_rating.toFixed(1)}</div>
                        <div className="stat-label">
                            <Star size={16} style={{ marginRight: '0.5rem' }} />
                            Average Rating
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.responses_today}</div>
                        <div className="stat-label">
                            <Users size={16} style={{ marginRight: '0.5rem' }} />
                            Responses Today
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    <div className="chart-container" style={{ minWidth: '400px', minHeight: '300px' }}>
                        <h3 className="chart-title">Feedback by Category (Bar_1)</h3>
                        {categoryFeedbackData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={categoryFeedbackData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="feedback" fill="var(--primary-brown)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p>No data available for Bar_1</p>
                        )}
                    </div>

                    <div className="chart-container" style={{ minWidth: '400px', minHeight: '300px' }}>
                        <h3 className="chart-title">Average Rating by Category (Bar_2)</h3>
                        {categoryMetricData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={categoryMetricData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                    <YAxis domain={[0, bar2YAxisMax]} />
                                    <Tooltip />
                                    <Bar dataKey="metric" fill="var(--accent-orange)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p>No data available for Bar_2</p>
                        )}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Feedback Sentiment by Category (Table_1)</h3>
                        <p>Weighted sentiment score based on feedback levels</p>
                    </div>
                    <div className="table-container">
                        <table className="table sentiment-table">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    {Object.keys(sentimentLabels).map((sentiment) => (
                                        <th key={sentiment}>{sentimentLabels[sentiment]}</th>
                                    ))}
                                    <th>Sentiment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(sentimentTableData).length > 0 ? (
                                    Object.keys(sentimentTableData).map((category) => {
                                        const data = sentimentTableData[category];
                                        const excellent = data.excellent || 0;
                                        const average = data.average || 0;
                                        const worst = data.worst || 0;
                                        const total = excellent + average + worst || 1;

                                        const weightedScore =
                                            ((worst * 1) + (average * 2) + (excellent * 3)) / total;
                                        const positivePct = Math.round((weightedScore / 3) * 100);

                                        let barColor = 'var(--danger-red)';
                                        if (positivePct >= 65) barColor = 'var(--success-green)';
                                        else if (positivePct >= 45) barColor = 'var(--warning-yellow)';

                                        return (
                                            <tr key={category}>
                                                <td>{category.charAt(0).toUpperCase() + category.slice(1)}</td>
                                                {Object.keys(sentimentLabels).map((sentiment) => (
                                                    <td key={sentiment}>
                                                        {sentimentTableData[category]?.[sentiment] ?? 0}
                                                    </td>
                                                ))}
                                                <td>
                                                    <div style={{
                                                        width: '100%',
                                                        background: '#eee',
                                                        borderRadius: '4px',
                                                        overflow: 'hidden',
                                                        height: '12px',
                                                        position: 'relative'
                                                    }}>
                                                        <div
                                                            style={{
                                                                width: `${positivePct}%`,
                                                                backgroundColor: barColor,
                                                                height: '100%'
                                                            }}
                                                        />
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                                                        {positivePct}%
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan={4}>No sentiment data available</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
