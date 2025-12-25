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
    const [authError, setAuthError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        console.log('[AuthProvider] Initializing Firebase Auth...');

        // Set a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
            console.warn('[AuthProvider] Auth initialization timeout after 5 seconds');
            if (loading) {
                setLoading(false);
                setAuthError('Authentication initialization timed out. Please refresh the page.');
            }
        }, 5000);

        let unsubscribe: (() => void) | null = null;

        try {
            unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
                console.log('[AuthProvider] Auth state changed:', firebaseUser ? 'User signed in' : 'User signed out');
                clearTimeout(timeoutId);

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
                            console.log('[AuthProvider] User restored from localStorage:', parsedUser.email);
                        } else {
                            // Fallback if no local data but firebase session exists (edge case)
                            console.warn('[AuthProvider] No saved user in localStorage, using fallback');
                            setUser({
                                name: 'Anonymous User',
                                email: 'anon@example.com',
                                role: 'Cashier',
                                uid: firebaseUser.uid
                            });
                        }
                    } catch (e) {
                        console.error('[AuthProvider] Failed to restore user role', e);
                        setAuthError('Failed to restore user session');
                    }
                } else {
                    // User is signed out.
                    console.log('[AuthProvider] User signed out');
                    setUser(null);
                }
                setLoading(false);
            }, (error) => {
                console.error('[AuthProvider] Auth state listener error:', error);
                clearTimeout(timeoutId);
                setLoading(false);
                setAuthError(`Authentication error: ${error.message}`);
            });
        } catch (error) {
            console.error('[AuthProvider] Failed to initialize auth listener:', error);
            clearTimeout(timeoutId);
            setLoading(false);
            setAuthError('Failed to initialize authentication');
        }

        return () => {
            clearTimeout(timeoutId);
            if (unsubscribe) {
                unsubscribe();
            }
        };
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
