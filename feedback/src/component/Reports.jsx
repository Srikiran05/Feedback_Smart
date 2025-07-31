import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Reports = () => {
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/feedback/analytics`);
                console.log('Analytics Data:', res.data); // Debug: verify response
                setAnalytics(res.data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            }
        };

        fetchAnalytics();
    }, []);

    if (!analytics) return <div className="p-4">Loading analytics...</div>;

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Feedback Analytics</h2>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="font-semibold">Total Feedbacks</h3>
                    <p>{analytics.total_feedbacks}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="font-semibold">Average Rating</h3>
                    <p>{analytics.average_rating}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="font-semibold">Responses Today</h3>
                    <p>{analytics.responses_today}</p>
                </div>
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-2">Recent Feedbacks</h3>
            <ul className="bg-white p-4 rounded shadow space-y-2">
                {analytics.recent_feedbacks.map((fb, idx) => (
                    <li key={idx} className="border-b pb-2">
                        <div className="font-medium">Table {fb.tableName}</div>
                        <div className="text-sm">{fb.feedback}</div>
                        <div className="text-xs text-gray-500">{new Date(fb.createdAt).toLocaleString()}</div>
                    </li>
                ))}
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-2">Table Breakdown</h3>
            <div className="overflow-auto">
                <table className="w-full bg-white rounded shadow">
                    <thead>
                        <tr>
                            <th className="p-2 border">Table</th>
                            <th className="p-2 border">Service</th>
                            <th className="p-2 border">Worst</th>
                            <th className="p-2 border">Average</th>
                            <th className="p-2 border">Excellent</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(analytics.table_breakdown).map(([table, services], i) =>
                            Object.entries(services).map(([service, ratings], j) => (
                                <tr key={`${i}-${j}`}>
                                    <td className="p-2 border">{j === 0 ? table : ''}</td>
                                    <td className="p-2 border">{service}</td>
                                    <td className="p-2 border">{ratings.worst}</td>
                                    <td className="p-2 border">{ratings.average}</td>
                                    <td className="p-2 border">{ratings.excellent}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reports;
