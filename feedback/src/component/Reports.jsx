import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { AlertCircle, TrendingUp } from 'lucide-react';
import Sidebar from './Sidebar';
import axios from 'axios';

const Reports = () => {
    const [reportData, setReportData] = useState({
        trends: [],
        summary: {
            totalFeedbacks: 0,
            averageRating: 0,
            responsesToday: 0,
            actionItems: 0
        }
    });

    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalyticsData();
    }, []);

    const fetchAnalyticsData = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/analytics`);
            const data = res.data;

            const trends = data.feedback_counts.map((count, index) => ({
                category: data.categories?.[index] || `Category ${index + 1}`,
                rating:
                    count > 0
                        ? parseFloat((data.total_ratings[index] / count).toFixed(2))
                        : 0,
                responses: count
            }));

            setReportData({
                trends,
                summary: {
                    totalFeedbacks: data.total_feedbacks,
                    averageRating: parseFloat(data.average_rating).toFixed(1),
                    responsesToday: data.responses_today,
                    actionItems: 3 // Placeholder, adjust if you have logic
                }
            });
        } catch (err) {
            console.error('Error loading report data:', err);
            setError('Failed to load report data.');
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

                {error ? (
                    <div className="text-red-500 p-4">{error}</div>
                ) : (
                    <>
                        <div className="chart-container">
                            <h3 className="chart-title">Rating Trends by Category</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={reportData.trends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="category" />
                                    <YAxis domain={[0, 5]} />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="rating"
                                        stroke="#8B4513"
                                        strokeWidth={3}
                                        dot={{ fill: '#FFA500', strokeWidth: 2, r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

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
                                    <div style={{ fontSize: '0.8rem', color: '#EAB308' }}>
                                        1 high priority
                                    </div>
                                </div>
                            </div>
                        </div>

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
                                            borderLeft: '4px solid #EF4444',
                                            backgroundColor: '#FFFAF0'
                                        }}
                                    >
                                        <strong>Improve service speed during lunch hours</strong>
                                        <p style={{ margin: '0.5rem 0' }}>
                                            Customers are rating below 4. Consider increasing staff between 12–2 PM.
                                        </p>
                                        <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: '#22C55E' }}>
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
                                            borderLeft: '4px solid #FACC15',
                                            backgroundColor: '#FFFAF0'
                                        }}
                                    >
                                        <strong>Low participation today</strong>
                                        <p style={{ margin: '0.5rem 0' }}>
                                            Only {reportData.summary.responsesToday} responses received. Push for more feedback.
                                        </p>
                                        <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: '#64748B' }}>
                                            Try incentives or reminders
                                        </p>
                                    </div>
                                )}

                                {reportData.summary.totalFeedbacks > 50 && (
                                    <div
                                        style={{
                                            marginBottom: '1rem',
                                            padding: '1rem',
                                            borderLeft: '4px solid #22C55E',
                                            backgroundColor: '#F0FFF4'
                                        }}
                                    >
                                        <strong>Consistent engagement</strong>
                                        <p style={{ margin: '0.5rem 0' }}>
                                            You’ve received over 50 feedback entries. Good sign of regular interaction.
                                        </p>
                                        <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: '#16A34A' }}>
                                            Keep maintaining service quality
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default Reports;
