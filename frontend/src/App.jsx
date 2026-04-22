// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Reports from './pages/Reports';
import Projects from './pages/Projects';
import Divisions from './pages/Divisions';
import Users from './pages/Users';
import Reporting from './pages/Reporting';
import Profile from './pages/Profile';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* RUTE PUBLIK */}
        <Route path="/login" element={<Login />} />
        
        {/* RUTE PRIVAT DIBUNGKUS LAYOUT */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          
          {/* Halaman yang dirender di dalam Outlet Layout */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="reports" element={<Reports />} />
          <Route path="projects" element={<Projects />} />
          <Route path="divisions" element={<Divisions />} />
          <Route path="users" element={<Users />} />
          <Route path="reporting" element={<Reporting />} />
          <Route path="profile" element={<Profile />} />
          
          {/* Redirect default ke dashboard */}
          <Route index element={<Navigate to="/dashboard" />} />
        </Route>

        {/* Jika URL tidak ditemukan */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;