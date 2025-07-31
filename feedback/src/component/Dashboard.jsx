import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Sidebar from './Sidebar';
import '../App.css';

const BACKEND_URL = import.meta.env.VITE_API_URL;
const CATEGORY = ['service', 'food', 'cleanliness', 'ambience'];
const sentimentLabels = { worst: 'Worst', average: 'Average', excellent: 'Excellent' };

const Dashboard = () => {
    const [sentimentTableData, setSentimentTableData] = useState({});
    const [ratingTrends, setRatingTrends] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [responsesToday, setResponsesToday] = useState(0);

    useEffect(() => {
        const fetchSentimentTable = async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/feedback/sentiment-table`);
                setSentimentTableData(res.data || {});
            } catch (err) {
                console.error('Error fetching sentiment table:', err);
            }
        };

        const fetchRatingTrends = async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/feedback/rating-trends`);
                setRatingTrends(res.data || []);
            } catch (err) {
                console.error('Error fetching rating trends:', err);
            }
        };

        const fetchStats = async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/feedback/summary`);
                setAverageRating(parseFloat(res.data.averageRating) || 0);
                setResponsesToday(parseInt(res.data.responsesToday) || 0);
            } catch (err) {
                console.error('Error fetching stats:', err);
            }
        };

        fetchSentimentTable();
        fetchRatingTrends();
        fetchStats();
    }, []);

    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="dashboard-main">
                <h1 className="dashboard-title">Dashboard</h1>

                <div className="dashboard-cards">
                    <div className="card">
                        <h3>Average Rating</h3>
                        <p className="card-value">{averageRating.toFixed(1)} ★</p>
                    </div>
                    <div className="card">
                        <h3>Responses Today</h3>
                        <p className="card-value">{responsesToday}</p>
                    </div>
                </div>

                <div className="chart-section">
                    <h3>Rating Trends by Category</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={ratingTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={[0, 5]} />
                                <Tooltip />
                                {CATEGORY.map((cat, index) => (
                                    <Bar key={cat} dataKey={cat} fill={['#f87171', '#facc15', '#34d399', '#60a5fa'][index]} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="sentiment-section">
                    <h3>Feedback Sentiment by Category</h3>
                    <div className="table-wrapper">
                        <table className="sentiment-table">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    {Object.values(sentimentLabels).map(label => (
                                        <th key={label}>{label}</th>
                                    ))}
                                    <th>Sentiment Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {CATEGORY.map(category => {
                                    const sent = sentimentTableData[category] || {};
                                    const worst = sent.worst || 0;
                                    const avg = sent.average || 0;
                                    const exc = sent.excellent || 0;
                                    const total = worst + avg + exc;
                                    const score = total === 0 ? 0 : Math.round(((worst * 1 + avg * 2 + exc * 3) / total) / 3 * 100);
                                    const barColor = score < 40 ? '#f87171' : score < 70 ? '#facc15' : '#34d399';

                                    return (
                                        <tr key={category}>
                                            <td>{category.charAt(0).toUpperCase() + category.slice(1)}</td>
                                            <td>{worst}</td>
                                            <td>{avg}</td>
                                            <td>{exc}</td>
                                            <td>
                                                <div className="progress-bar-container">
                                                    <div
                                                        className="progress-bar-fill"
                                                        style={{ width: `${score}%`, backgroundColor: barColor }}
                                                    ></div>
                                                </div>
                                                <div className="score-label">{score}%</div>
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
