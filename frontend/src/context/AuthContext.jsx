import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

const API = API_URL;
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Rehydrate from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('ts_token');
        const storedUser = localStorage.getItem('ts_user');
        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsedUser);
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            } catch {
                localStorage.removeItem('ts_token');
                localStorage.removeItem('ts_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const loginRes = await axios.post(`${API}/login`, { username, password });
        const accessToken = loginRes.data.access_token;

        // Set global auth header immediately
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        // Fetch user profile
        const meRes = await axios.get(`${API}/users/me`);
        const userData = { id: meRes.data.id || null, username: meRes.data.username };

        // Persist to localStorage
        localStorage.setItem('ts_token', accessToken);
        localStorage.setItem('ts_user', JSON.stringify(userData));

        setToken(accessToken);
        setUser(userData);
    };

    const register = async (username, password) => {
        await axios.post(`${API}/register`, { username, password });
        // Auto-login after successful registration
        await login(username, password);
    };

    const logout = () => {
        localStorage.removeItem('ts_token');
        localStorage.removeItem('ts_user');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
    };

    const isAuthenticated = !!user && !!token;

    return (
        <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
