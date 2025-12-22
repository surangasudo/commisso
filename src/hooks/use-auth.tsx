'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signInAnonymously, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

type User = {
    name: string;
    email: string;
    role: 'Admin' | 'Cashier';
    uid?: string;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (userData: { name: string, email: string, role: 'Admin' | 'Cashier' }) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => { },
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in.
                // We still need to recover their "role" from local storage since anonymous auth doesn't store that.
                try {
                    const savedUser = localStorage.getItem('erp-user');
                    if (savedUser) {
                        const parsedUser = JSON.parse(savedUser);
                        setUser({
                            ...parsedUser,
                            uid: firebaseUser.uid
                        });
                    } else {
                        // Fallback if no local data but firebase session exists (edge case)
                        setUser({
                            name: 'Anonymous User',
                            email: 'anon@example.com',
                            role: 'Cashier',
                            uid: firebaseUser.uid
                        });
                    }
                } catch (e) {
                    console.error("Failed to restore user role", e);
                }
            } else {
                // User is signed out.
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (userData: { name: string, email: string, role: 'Admin' | 'Cashier' }) => {
        setLoading(true);
        try {
            await signInAnonymously(auth);

            // Store role metadata locally used for UI
            localStorage.setItem('erp-user', JSON.stringify(userData));

            // State update will happen in onAuthStateChanged
        } catch (error) {
            console.error("Login failed", error);
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('erp-user');
            router.push('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const value = { user, loading, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
