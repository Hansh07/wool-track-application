import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));

    const fetchMe = useCallback(async (token) => {
        try {
            // Server returns flat object: { _id, name, email, role, permissions, ... }
            const res = await axios.get('/api/auth/me', { headers: { Authorization: 'Bearer ' + token } });
            setUser(res.data);
        } catch {
            setUser(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) { fetchMe(token).finally(() => setLoading(false)); }
        else setLoading(false);
    }, [fetchMe]);

    const login = (data) => {
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        setAccessToken(data.accessToken);
        // Server returns user fields at top level, not nested under 'user'
        const { accessToken: _a, refreshToken: _r, ...userData } = data;
        setUser(userData);
    };

    const register = async (name, email, password, role) => {
        const res = await axios.post('/api/auth/register', { name, email, password, role });
        login(res.data);
    };

    const logout = async () => {
        try {
            const rt = localStorage.getItem('refreshToken');
            if (rt) await axios.post('/api/auth/logout', { refreshToken: rt });
        } catch { }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setAccessToken(null);
    };

    const updateUser = (updates) => setUser(prev => ({ ...prev, ...updates }));

    const hasPermission = useCallback((permission) => {
        if (!user) return false;
        if (user.role === 'ADMIN') return true;
        return user.permissions?.includes(permission) ?? false;
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register, updateUser, accessToken, hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export default AuthContext;
