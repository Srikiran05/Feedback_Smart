import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';
import Sidebar from './Sidebar';
import axios from 'axios';

const CATEGORY = ['ambience', 'cleanliness', 'taste', 'service', 'value'];

const Reports = () => {
    const [reportData, setReportData] = useState({
        trends: [],
        summary: {
            totalFeedbacks: 0,
            averageRating: 0,
            responsesToday: 0,
            actionItems: 3
        }
    });

    useEffect(() => {
        fetchAnalyticsData();
    }, []);

    const fetchAnalyticsData = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/feedback/analytics`);
            const data = res.data;

            const tableBreakdown = data.table_breakdown || {};
            const responsesToday = data.responses_today || 0;
            const averageRating = parseFloat(data.average_rating || 0).toFixed(1);

            const categoryTotals = CATEGORY.map((cat, idx) => {
                let totalResponses = 0;
                let totalScore = 0;

                Object.values(tableBreakdown).forEach(table => {
                    const feedback = table[cat];
                    if (feedback) {
                        const worst = feedback.worst || 0;
                        const average = feedback.average || 0;
                        const excellent = feedback.excellent || 0;
                        const responses = worst + average + excellent;
                        const score = worst * 1 + average * 2 + excellent * 3;

                        totalResponses += responses;
                        totalScore += score;
                    }
                });

                return {
                    date: `Category ${idx + 1}`,
                    rating: totalResponses ? parseFloat((totalScore / totalResponses).toFixed(2)) : 0,
                    responses: totalResponses
                };
            });

            const totalFeedbacks = categoryTotals.reduce((sum, c) => sum + c.responses, 0);

            setReportData({
                trends: categoryTotals,
                summary: {
                    totalFeedbacks,
                    averageRating,
                    responsesToday,
                    actionItems: 3
                }
            });
        } catch (error) {
            console.error('Error loading report data:', error.message);
        }
    };

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="main-content">
                <div className="dashboard-header">
                    <div>
                        <h1>Weekly Reports</h1>
                        <p>Real-time analytics and summary</p>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="chart-container">
                    <h3 className="chart-title">Rating Trends by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={reportData.trends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[1, 5]} />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="rating"
                                stroke="var(--primary-brown)"
                                strokeWidth={3}
                                dot={{ fill: 'var(--accent-orange)', strokeWidth: 2, r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Weekly Summary */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Weekly Summary</h3>
                        <p>Real-time performance indicators</p>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">{reportData.summary.averageRating}</div>
                            <div className="stat-label">Average Rating</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{reportData.summary.totalFeedbacks}</div>
                            <div className="stat-label">Total Feedbacks</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{reportData.summary.responsesToday}</div>
                            <div className="stat-label">Responses Today</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{reportData.summary.actionItems}</div>
                            <div className="stat-label">Action Items</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--warning-yellow)' }}>
                                1 high priority
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <AlertCircle size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            Actionable Recommendations
                        </h3>
                        <p>Smart suggestions based on real-time feedback trends</p>
                    </div>

                    <div style={{ padding: '1rem' }}>
                        {reportData.summary.averageRating < 4 && (
                            <div
                                style={{
                                    marginBottom: '1rem',
                                    padding: '1rem',
                                    borderLeft: '4px solid var(--danger-red)',
                                    backgroundColor: 'var(--warm-white)',
                                }}
                            >
                                <strong>Improve service speed during lunch hours</strong>
                                <p style={{ margin: '0.5rem 0' }}>
                                    Customers are rating below 4. Consider increasing staff between 12–2 PM.
                                </p>
                                <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--success-green)' }}>
                                    <TrendingUp size={14} style={{ marginRight: '0.3rem' }} />
                                    Could boost ratings by 0.3 points
                                </p>
                            </div>
                        )}

                        {reportData.summary.responsesToday < 10 && (
                            <div
                                style={{
                                    marginBottom: '1rem',
                                    padding: '1rem',
                                    borderLeft: '4px solid var(--warning-yellow)',
                                    backgroundColor: 'var(--warm-white)',
                                }}
                            >
                                <strong>Low participation today</strong>
                                <p style={{ margin: '0.5rem 0' }}>
                                    Only {reportData.summary.responsesToday} responses received. Push for more feedback.
                                </p>
                                <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                                    Try incentives or reminders
                                </p>
                            </div>
                        )}

                        {reportData.summary.totalFeedbacks > 50 && (
                            <div
                                style={{
                                    marginBottom: '1rem',
                                    padding: '1rem',
                                    borderLeft: '4px solid var(--success-green)',
                                    backgroundColor: 'var(--warm-white)',
                                }}
                            >
                                <strong>Consistent engagement</strong>
                                <p style={{ margin: '0.5rem 0' }}>
                                    You’ve received over 50 feedback entries. Good sign of regular interaction.
                                </p>
                                <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--success-green)' }}>
                                    Keep maintaining service quality
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Reports;
