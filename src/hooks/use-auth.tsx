'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type User = {
    name: string;
    role: 'Admin' | 'Cashier';
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (role: 'Admin' | 'Cashier') => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: () => {},
    logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const loadUserFromStorage = useCallback(() => {
        try {
            const savedUser = localStorage.getItem('erp-user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUserFromStorage();
        window.addEventListener('storage', loadUserFromStorage);
        return () => window.removeEventListener('storage', loadUserFromStorage);
    }, [loadUserFromStorage]);

    const login = (role: 'Admin' | 'Cashier') => {
        const name = role === 'Admin' ? 'Mr Admin' : 'Mr Cashier';
        const userData = { name, role };
        localStorage.setItem('erp-user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('erp-user');
        setUser(null);
        router.push('/login');
    };

    const value = { user, loading, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
