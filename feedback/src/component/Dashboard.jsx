// Keep this version saved as final working base
import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { MessageSquare, Star, Users } from 'lucide-react';
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
    const [bar2YAxisMax, setBar2YAxisMax] = useState(5);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/feedback/analytics`);
            const data = response.data;

            const totalFeedbacks = data.total_feedbacks || 0;
            const avgRating = parseFloat(data.average_rating) || 0;
            const todayResponses = data.responses_today || 0;

            setStats({
                total_feedbacks: totalFeedbacks,
                average_rating: avgRating,
                responses_today: todayResponses,
            });

            const feedbackCounts = data.feedback_counts || [];
            const totalRatings = data.total_ratings || [];

            setCategoryFeedbackData(
                CATEGORY.map((cat, index) => ({
                    name: cat.charAt(0).toUpperCase() + cat.slice(1),
                    feedback: feedbackCounts[index] || 0,
                }))
            );

            setCategoryMetricData(
                CATEGORY.map((cat, index) => ({
                    name: cat.charAt(0).toUpperCase() + cat.slice(1),
                    metric:
                        feedbackCounts[index] > 0
                            ? parseFloat((totalRatings[index] / feedbackCounts[index]).toFixed(1))
                            : 0,
                }))
            );

            const sentimentData = {};
            CATEGORY.forEach(cat => sentimentData[cat] = { worst: 0, average: 0, excellent: 0 });

            Object.values(data.table_breakdown || {}).forEach(tbl => {
                CATEGORY.forEach(cat => {
                    if (tbl[cat]) {
                        sentimentData[cat].worst += tbl[cat].worst || 0;
                        sentimentData[cat].average += tbl[cat].average || 0;
                        sentimentData[cat].excellent += tbl[cat].excellent || 0;
                    }
                });
            });

            setSentimentTableData(sentimentData);

            const maxMetric = Math.max(...feedbackCounts.map((_, i) => {
                return feedbackCounts[i] > 0 ? totalRatings[i] / feedbackCounts[i] : 0;
            })) + 1;

            setBar2YAxisMax(maxMetric > 5 ? maxMetric : 5);

        } catch (err) {
            console.error('Error fetching analytics data:', err);
        }
    };

    const sentimentLabels = SENTIMENT_STRING.reduce((acc, s) => {
        acc[s.toLowerCase()] = s;
        return acc;
    }, {});

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="main-content">
                <div className="dashboard-header">
                    <h1>Dashboard</h1>
                    <p>Overview of customer feedback and insights</p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{stats.total_feedbacks}</div>
                        <div className="stat-label">
                            <MessageSquare size={16} /> Total Feedback
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.average_rating.toFixed(1)}</div>
                        <div className="stat-label">
                            <Star size={16} /> Average Rating
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.responses_today}</div>
                        <div className="stat-label">
                            <Users size={16} /> Responses Today
                        </div>
                    </div>
                </div>

                <div className="charts-row">
                    <div className="chart-box">
                        <h3>Feedback by Category</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={categoryFeedbackData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="feedback" fill="#8B4513" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-box">
                        <h3>Average Rating by Category</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={categoryMetricData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                <YAxis domain={[0, bar2YAxisMax]} />
                                <Tooltip />
                                <Bar dataKey="metric" fill="#FFA500" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="sentiment-section">
                    <h3>Feedback Sentiment by Category</h3>
                    <table className="sentiment-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                {Object.values(sentimentLabels).map(label => (
                                    <th key={label}>{label}</th>
                                ))}
                                <th>Sentiment Score</th>
                                <th>Visual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {CATEGORY.map(cat => {
                                const sent = sentimentTableData[cat] || {};
                                const worst = sent.worst || 0;
                                const avg = sent.average || 0;
                                const exc = sent.excellent || 0;
                                const total = worst + avg + exc || 1;
                                const score = Math.round(((worst * 1 + avg * 2 + exc * 3) / total) / 3 * 100);
                                const worstPct = (worst / total) * 100;
                                const avgPct = (avg / total) * 100;
                                const excPct = (exc / total) * 100;

                                return (
                                    <tr key={cat}>
                                        <td>{cat.charAt(0).toUpperCase() + cat.slice(1)}</td>
                                        <td>{worst}</td>
                                        <td>{avg}</td>
                                        <td>{exc}</td>
                                        <td>{score}%</td>
                                        <td style={{ width: "25%" }}>
                                            <div style={{ display: "flex", height: "10px", width: "100%", borderRadius: "4px", overflow: "hidden", backgroundColor: "#e5e7eb" }}>
                                                <div style={{ width: `${worstPct}%`, backgroundColor: "#ef4444" }}></div>
                                                <div style={{ width: `${avgPct}%`, backgroundColor: "#facc15" }}></div>
                                                <div style={{ width: `${excPct}%`, backgroundColor: "#10b981" }}></div>
                                            </div>
                                        </td>
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
