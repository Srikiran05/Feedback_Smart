import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const BACKEND_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
    const [categoryFeedbackData, setCategoryFeedbackData] = useState([]);
    const [categoryMetricData, setCategoryMetricData] = useState([]);
    const [sentimentTableData, setSentimentTableData] = useState({});
    const [actualCategoryMentions, setActualCategoryMentions] = useState({});

    const sentimentLabels = {
        positive: 'Positive',
        neutral: 'Neutral',
        negative: 'Negative',
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/api/analytics`);
                const data = response.data;

                setCategoryFeedbackData(data.feedback_counts || []);
                setCategoryMetricData(data.total_ratings || []);
                setSentimentTableData(data.table_breakdown || {});
                setActualCategoryMentions(data.actual_category_mentions || {});
            } catch (error) {
                console.error('Error loading report data:', error);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Smart Feedback Dashboard</h1>

            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-center">Total Feedback per Category</h2>
                {Array.isArray(categoryFeedbackData) && categoryFeedbackData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryFeedbackData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-center text-gray-500">No category feedback data available.</p>
                )}
            </div>

            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-center">Total Metrics per Category</h2>
                {Array.isArray(categoryMetricData) && categoryMetricData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryMetricData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="metric" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-center text-gray-500">No category metric data available.</p>
                )}
            </div>

            <div className="overflow-x-auto">
                <h2 className="text-xl font-semibold mb-4 text-center">Table-wise Sentiment Breakdown</h2>
                <table className="min-w-full table-auto border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 border">Table</th>
                            {sentimentLabels &&
                                Object.keys(sentimentLabels).map((sentiment) => (
                                    <th key={sentiment} className="px-4 py-2 border">{sentimentLabels[sentiment]}</th>
                                ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sentimentTableData && Object.keys(sentimentTableData).length > 0 ? (
                            Object.keys(sentimentTableData).map((table) => (
                                <tr key={table}>
                                    <td className="px-4 py-2 border text-center">{table}</td>
                                    {Object.keys(sentimentLabels).map((sentiment) => (
                                        <td key={sentiment} className="px-4 py-2 border text-center">
                                            {sentimentTableData[table]?.[sentiment] || 0}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={Object.keys(sentimentLabels).length + 1} className="text-center py-4 text-gray-500">
                                    No sentiment data available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
