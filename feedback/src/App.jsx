import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Reports from './component/Reports'; // Make sure path & extension are correct
import Dashboard from './component/Dashboard.jsx';
import TableManagement from './component/TableManagement.jsx';
import FeedbackForm from './component/feedback'; // ✅ Re-added

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/reports" element={<Reports />} /> {/* ✅ This should replace old feedback route */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tables" element={<TableManagement />} />
        <Route path="/feedback/table/:tableId" element={<FeedbackForm />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
