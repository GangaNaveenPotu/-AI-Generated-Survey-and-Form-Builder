import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FormBuilder from './components/FormBuilder';
import FormRenderer from './components/FormRenderer';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <nav className="bg-white shadow p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">AI Form Builder</Link>
            <div className="space-x-4">
              <Link to="/" className="text-gray-600 hover:text-blue-500">Create</Link>
              <Link to="/dashboard" className="text-gray-600 hover:text-blue-500">Dashboard</Link>
            </div>
          </div>
        </nav>
        <main className="flex-grow p-4">
          <Routes>
            <Route path="/" element={<FormBuilder />} />
            <Route path="/edit/:id" element={<FormBuilder />} />
            <Route path="/form/:id" element={<FormRenderer />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics/:id" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
