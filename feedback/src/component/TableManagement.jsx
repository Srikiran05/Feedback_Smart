import React, { useState, useEffect } from 'react';
import { QrCode, Plus, Edit3, Trash2, Download, ExternalLink } from 'lucide-react';
import Sidebar from './Sidebar';
import axios from 'axios';

const TableManagement = () => {
    const [tables, setTables] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTable, setNewTable] = useState({ id: '', location: '', capacity: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get('http://192.168.0.103:5000/api/tables');
            const backendTables = response.data;

            const formatted = backendTables.map((table) => ({
                ...table,
                qrCode: `/qrcodes/table-${table.id}.png`,
            }));

            setTables(formatted);
        } catch (error) {
            console.error('Failed to fetch tables:', error);
            setError('Failed to load tables. Please ensure the backend server is running and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTable = async (e) => {
        e.preventDefault();

        const newTableData = {
            ...newTable,
            feedbackCount: 0,
            averageRating: 0,
        };

        try {
            await axios.post('http://192.168.0.103:5000/api/tables', newTableData);
            fetchTables();
            setNewTable({ id: '', location: '', capacity: '' });
            setShowAddModal(false);
        } catch (err) {
            console.error('Error adding table:', err);
            setError('Failed to add table. Please try again.');
        }
    };

    const handleDeleteTable = async (tableId) => {
        if (window.confirm('Are you sure you want to delete this table?')) {
            try {
                await axios.delete(`http://192.168.0.103:5000/api/tables/${tableId}`);
                fetchTables();
            } catch (err) {
                console.error('Error deleting table:', err);
                setError('Failed to delete table. Please try again.');
            }
        }
    };

    const downloadQRCode = (table) => {
        const link = document.createElement('a');
        link.href = table.qrCode;
        link.download = `table-${table.id}-qr.jpeg`;
        link.click();
    };

    const downloadAllQRCodes = () => {
        tables.forEach((table, index) => {
            setTimeout(() => downloadQRCode(table), index * 500);
        });
    };

    if (loading) {
        return (
            <div className="dashboard">
                <Sidebar />
                <main className="main-content">
                    <h2>Loading tables...</h2>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard">
                <Sidebar />
                <main className="main-content">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={fetchTables}>
                        Retry
                    </button>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="main-content">
                <div className="dashboard-header">
                    <div>
                        <h1>Table Management</h1>
                        <p>Manage your café tables and QR codes</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-outline" onClick={downloadAllQRCodes}>
                            <Download size={20} />
                            Download All QR Codes
                        </button>
                        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                            <Plus size={20} />
                            Add New Table
                        </button>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{tables.length}</div>
                        <div className="stat-label">Total Tables</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">
                            {tables.reduce((sum, table) => sum + (table.feedbackCount || 0), 0)}
                        </div>
                        <div className="stat-label">Total Feedback</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{tables.reduce((sum, t) => sum + (t.capacity || 0), 0)}</div>
                        <div className="stat-label">Total Capacity</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {tables.map((table) => (
                        <div key={table.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 className="card-title">Table {table.id}</h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn btn-outline" style={{ padding: '0.5rem' }}>
                                        <Edit3 size={16} />
                                    </button>
                                    <button
                                        className="btn"
                                        style={{ padding: '0.5rem', backgroundColor: 'var(--danger-red)', color: 'white' }}
                                        onClick={() => handleDeleteTable(table.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '1rem', alignItems: 'center' }}>
                                <div>
                                    <p><strong>Location:</strong> {table.location}</p>
                                    <p><strong>Capacity:</strong> {table.capacity} people</p>
                                    <p><strong>Feedback:</strong> {table.feedbackCount} responses</p>

                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                                            onClick={() => downloadQRCode(table)}
                                        >
                                            <Download size={14} />
                                            QR Code
                                        </button>
                                    </div>
                                </div>

                                <div className="qr-code-container" style={{ padding: '1rem', textAlign: 'center' }}>
                                    <img
                                        src={table.qrCode}
                                        alt={`QR Code for Table ${table.id}`}
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                    />
                                    <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-light)' }}>
                                        Scan for feedback
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {showAddModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div className="card" style={{ width: '400px', margin: '2rem' }}>
                            <div className="card-header">
                                <h3 className="card-title">Add New Table</h3>
                            </div>

                            <form onSubmit={handleAddTable}>
                                <div className="form-group">
                                    <label className="form-label">Table ID *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={newTable.id}
                                        onChange={(e) => setNewTable({ ...newTable, id: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Location *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={newTable.location}
                                        onChange={(e) => setNewTable({ ...newTable, location: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Capacity *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={newTable.capacity}
                                        onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) || '' })}
                                        required
                                        min="1"
                                        max="20"
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">Add Table</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TableManagement;
