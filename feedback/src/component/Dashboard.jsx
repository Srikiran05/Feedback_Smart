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
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 p-8 ml-64">
                {/* Dashboard Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                    <p className="text-gray-600">Overview of customer feedback and insights</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                    {stats.total_feedbacks}
                                </div>
                                <div className="text-sm text-gray-600 flex items-center gap-2">
                                    <MessageSquare size={16} className="text-blue-500" />
                                    Total Feedback
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <MessageSquare size={24} className="text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                    {stats.average_rating.toFixed(1)}
                                </div>
                                <div className="text-sm text-gray-600 flex items-center gap-2">
                                    <Star size={16} className="text-yellow-500" />
                                    Average Rating
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Star size={24} className="text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                    {stats.responses_today}
                                </div>
                                <div className="text-sm text-gray-600 flex items-center gap-2">
                                    <Users size={16} className="text-green-500" />
                                    Responses Today
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Users size={24} className="text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Feedback by Category</h3>
                            <p className="text-sm text-gray-600">Total number of feedback responses per category</p>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryFeedbackData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                        fontSize={12}
                                        stroke="#64748b"
                                    />
                                    <YAxis fontSize={12} stroke="#64748b" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Bar
                                        dataKey="feedback"
                                        fill="#3b82f6"
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={35}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Average Rating by Category</h3>
                            <p className="text-sm text-gray-600">Mean rating score for each feedback category</p>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryMetricData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                        fontSize={12}
                                        stroke="#64748b"
                                    />
                                    <YAxis
                                        domain={[0, bar2YAxisMax]}
                                        fontSize={12}
                                        stroke="#64748b"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Bar
                                        dataKey="metric"
                                        fill="#f59e0b"
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={35}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Sentiment Analysis Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Feedback Sentiment by Category</h3>
                        <p className="text-sm text-gray-600">Detailed breakdown of sentiment analysis across all categories</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900 bg-gray-50 rounded-tl-lg">
                                        Category
                                    </th>
                                    {Object.values(sentimentLabels).map((label) => (
                                        <th key={label} className="text-center py-3 px-4 font-semibold text-gray-900 bg-gray-50">
                                            {label}
                                        </th>
                                    ))}
                                    <th className="text-center py-3 px-4 font-semibold text-gray-900 bg-gray-50">
                                        Sentiment Score
                                    </th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-900 bg-gray-50 rounded-tr-lg">
                                        Distribution
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {CATEGORY.map((cat, categoryIndex) => {
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
                                        <tr
                                            key={cat}
                                            className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${categoryIndex === CATEGORY.length - 1 ? 'border-b-0' : ''
                                                }`}
                                        >
                                            <td className="py-4 px-4 font-medium text-gray-900">
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                                    {worst}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                                    {avg}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                                    {exc}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${score >= 80 ? 'bg-green-100 text-green-800' :
                                                        score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {score}%
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="w-full max-w-32 mx-auto">
                                                    <div className="flex h-3 bg-gray-200 rounded-full overflow-hidden">
                                                        {worstPct > 0 && (
                                                            <div
                                                                className="bg-red-500 transition-all duration-300"
                                                                style={{ width: `${worstPct}%` }}
                                                                title={`Worst: ${worstPct.toFixed(1)}%`}
                                                            />
                                                        )}
                                                        {avgPct > 0 && (
                                                            <div
                                                                className="bg-yellow-500 transition-all duration-300"
                                                                style={{ width: `${avgPct}%` }}
                                                                title={`Average: ${avgPct.toFixed(1)}%`}
                                                            />
                                                        )}
                                                        {excPct > 0 && (
                                                            <div
                                                                className="bg-green-500 transition-all duration-300"
                                                                style={{ width: `${excPct}%` }}
                                                                title={`Excellent: ${excPct.toFixed(1)}%`}
                                                            />
                                                        )}
                                                    </div>
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