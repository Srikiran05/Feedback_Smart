import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import axios from 'axios';
import Sidebar from './Sidebar';
import { CATEGORY, SENTIMENT_STRING } from '../constants';

const Dashboard = () => {
    const [stats, setStats] = useState({ total_feedbacks: 0, average_rating: 0, responses_today: 0 });
    const [categoryFeedbackData, setCategoryFeedbackData] = useState([]);
    const [categoryMetricData, setCategoryMetricData] = useState([]);
    const [sentimentTableData, setSentimentTableData] = useState({});
    const [bar2YAxisMax, setBar2YAxisMax] = useState(5);
    const [error, setError] = useState('');

    useEffect(() => { fetchDashboardData(); }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/feedback/analytics`);
            const data = res.data;
            console.log('API Data:', data);

            setStats({
                total_feedbacks: data.total_feedbacks || 0,
                average_rating: parseFloat(data.average_rating) || 0,
                responses_today: data.responses_today || 0,
            });

            const feedbackCounts = Array.isArray(data.feedback_counts) ? data.feedback_counts : [];
            const totalRatings = Array.isArray(data.total_ratings) ? data.total_ratings : [];

            const fbData = CATEGORY.map((cat, i) => ({
                name: cat.charAt(0).toUpperCase() + cat.slice(1),
                feedback: Number.isFinite(feedbackCounts[i]) ? feedbackCounts[i] : 0
            }));
            setCategoryFeedbackData(fbData);
            console.log('categoryFeedbackData:', fbData);

            const metricData = CATEGORY.map((cat, i) => ({
                name: cat.charAt(0).toUpperCase() + cat.slice(1),
                metric: feedbackCounts[i] > 0
                    ? parseFloat((totalRatings[i] / feedbackCounts[i]).toFixed(1))
                    : 0
            }));
            setCategoryMetricData(metricData);
            console.log('categoryMetricData:', metricData);

            const sentiment = {};
            CATEGORY.forEach(cat => {
                sentiment[cat] = { worst: 0, average: 0, excellent: 0 };
            });
            Object.values(data.table_breakdown || {}).forEach(tbl => {
                CATEGORY.forEach(cat => {
                    if (tbl[cat]) {
                        sentiment[cat].worst += tbl[cat].worst || 0;
                        sentiment[cat].average += tbl[cat].average || 0;
                        sentiment[cat].excellent += tbl[cat].excellent || 0;
                    }
                });
            });
            setSentimentTableData(sentiment);
            console.log('sentimentTableData:', sentiment);

            const maxMetric = Math.max(...metricData.map(d => d.metric)) + 1;
            setBar2YAxisMax(maxMetric > 5 ? maxMetric : 5);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard');
        }
    };

    const sentimentLabels = SENTIMENT_STRING.reduce((acc, s) => {
        acc[s.toLowerCase()] = s;
        return acc;
    }, {});

    if (error) return <div className="error">{error}</div>;

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="main-content">
                {/* Stat Cards */}
                <div className="stats-grid">
                    <div><strong>{stats.total_feedbacks}</strong><p>Total Feedback</p></div>
                    <div><strong>{stats.average_rating.toFixed(1)}</strong><p>Average Rating</p></div>
                    <div><strong>{stats.responses_today}</strong><p>Responses Today</p></div>
                </div>

                {/* Bar Charts */}
                <div className="charts-grid">
                    <div className="chart" style={{ minHeight: 320 }}>
                        <h3>Feedback by Category</h3>
                        {categoryFeedbackData.length ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={categoryFeedbackData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="feedback" fill="#8B4513" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p>No data for Bar_1</p>
                        )}
                    </div>

                    <div className="chart" style={{ minHeight: 320 }}>
                        <h3>Average Rating by Category</h3>
                        {categoryMetricData.length ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={categoryMetricData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                    <YAxis domain={[0, bar2YAxisMax]} />
                                    <Tooltip />
                                    <Bar dataKey="metric" fill="#FFA500" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p>No data for Bar_2</p>
                        )}
                    </div>
                </div>

                {/* Sentiment Table */}
                <div className="sentiment-card">
                    <h3>Feedback Sentiment by Category</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Category</th>
                                {Object.values(sentimentLabels).map(s => <th key={s}>{s}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {CATEGORY.map(cat => {
                                const vals = sentimentTableData[cat] || {};
                                const worst = vals.worst || 0;
                                const avg = vals.average || 0;
                                const ex = vals.excellent || 0;
                                const total = worst + avg + ex || 1;
                                const score = Math.round(((worst * 1 + avg * 2 + ex * 3) / total) / 3 * 100);
                                return (
                                    <tr key={cat}>
                                        <td>{cat.charAt(0).toUpperCase() + cat.slice(1)}</td>
                                        <td>{vals.worst ?? 0}</td>
                                        <td>{vals.average ?? 0}</td>
                                        <td>{vals.excellent ?? 0}</td>
                                        <td>{score}%</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
