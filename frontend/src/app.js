import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BookServices from './bookservices';
import Dashboard from './dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BookServices />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;