import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Components
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Detector from './components/Detector';
import DetectionHistory from './components/DetectionHistory';
import ApiDocs from './components/ApiDocs';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import Status from './components/Status';

function App() {
    return (
        <AuthProvider>
            <div className="min-h-screen text-white font-sans" style={{ backgroundColor: 'var(--home-bg)' }}>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/scanner" element={
                        <ProtectedRoute allowGuest={true}>
                            <Detector />
                        </ProtectedRoute>
                    } />
                    <Route path="/detect" element={
                        <ProtectedRoute allowGuest={true}>
                            <Detector />
                        </ProtectedRoute>
                    } />
                    <Route path="/history" element={
                        <ProtectedRoute allowGuest={false}>
                            <DetectionHistory />
                        </ProtectedRoute>
                    } />
                    <Route path="/api-docs" element={<ApiDocs />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/status" element={<Status />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </AuthProvider>
    );
}

export default App;
