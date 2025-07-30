import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Coffee, MessageSquare, Star, Users } from 'lucide-react';
import axios from 'axios';
import Sidebar from './Sidebar';
import { SENTIMENT_STRING, CATEGORY as CATEGORIES } from '../constants';

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
    const [bar2YAxisMax, setBar2YAxisMax] = useState(10);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/analytics`);
            const data = response.data;

            const totalFeedbacks = data.total_feedbacks || 0;

            setStats({
                total_feedbacks: totalFeedbacks,
                average_rating: parseFloat(data.average_rating) || 0,
                responses_today: data.responses_today || 0,
            });

            setCategoryFeedbackData(
                CATEGORIES.map((cat, index) => ({
                    name: cat.charAt(0).toUpperCase() + cat.slice(1),
                    feedback: data.feedback_counts?.[index] || 0,
                }))
            );

            setCategoryMetricData(
                CATEGORIES.map((cat, index) => ({
                    name: cat.charAt(0).toUpperCase() + cat.slice(1),
                    metric:
                        data.feedback_counts?.[index] > 0
                            ? (data.total_ratings?.[index] / data.feedback_counts[index]).toFixed(1)
                            : 0,
                }))
            );

            const sentimentData = {};
            const mentionCounter = {};

            CATEGORIES.forEach((cat) => {
                sentimentData[cat] = { worst: 0, average: 0, excellent: 0 };
                mentionCounter[cat] = 0;
            });

            Object.values(data.table_breakdown || {}).forEach((table) => {
                CATEGORIES.forEach((cat) => {
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

            const bar2Max = Object.values(mentionCounter).reduce((a, b) => a + b, 0);
            setBar2YAxisMax(bar2Max > 0 ? bar2Max : 10);
        } catch (error) {
            console.error('Error fetching dashboard data:', error.message);
        }
    };

    const sentimentLabels = SENTIMENT_STRING.reduce((acc, sentiment) => {
        acc[sentiment.toLowerCase()] = sentiment;
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
                    <div className="chart-container">
                        <h3 className="chart-title">Feedback by Category (Bar_1)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={categoryFeedbackData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="feedback" fill="var(--primary-brown)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-container">
                        <h3 className="chart-title">Average Rating by Category (Bar_2)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={categoryMetricData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                <YAxis domain={[0, bar2YAxisMax]} />
                                <Tooltip />
                                <Bar dataKey="metric" fill="var(--accent-orange)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
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
                                {Object.keys(sentimentTableData).map((category) => {
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
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
