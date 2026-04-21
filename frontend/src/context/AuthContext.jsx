import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
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
        const userData = {
            id: meRes.data.id || null,
            username: meRes.data.username,
            display_name: meRes.data.display_name || null,
            photo_url: meRes.data.photo_url || null,
            auth_provider: meRes.data.auth_provider || null,
        };

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

    const loginWithGoogle = async () => {
        // 1. Pop up Google sign-in dialog via Firebase
        const result = await signInWithPopup(auth, googleProvider);

        // 2. Get the Firebase ID token
        const idToken = await result.user.getIdToken();

        // Pull profile info from the Firebase user object
        const displayName = result.user.displayName || null;
        const photoURL = result.user.photoURL || null;

        // 3. Hand it to our backend's bridge endpoint
        const bridgeRes = await axios.post(`${API}/auth/firebase-bridge`, {
            id_token: idToken,
            display_name: displayName,
            photo_url: photoURL,
        });
        const accessToken = bridgeRes.data.access_token;

        // 4. Set global auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        // 5. Fetch user profile (same as normal login)
        const meRes = await axios.get(`${API}/users/me`);
        const userData = {
            id: meRes.data.id || null,
            username: meRes.data.username,
            display_name: meRes.data.display_name || null,
            photo_url: meRes.data.photo_url || null,
            auth_provider: meRes.data.auth_provider || null,
        };

        // 6. Persist to localStorage (same keys as normal login)
        localStorage.setItem('ts_token', accessToken);
        localStorage.setItem('ts_user', JSON.stringify(userData));

        setToken(accessToken);
        setUser(userData);
    };

    const isAuthenticated = !!user && !!token;

    return (
        <AuthContext.Provider value={{
            user, token, loading, isAuthenticated,
            login, logout, register, loginWithGoogle,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
