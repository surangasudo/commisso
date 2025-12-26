'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import {
    signInAnonymously,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
    updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { type User, type UserRole, SUPERADMIN_EMAILS } from '@/lib/data';

const googleProvider = new GoogleAuthProvider();

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: (asSuperAdmin?: boolean) => Promise<void>;
    loginAsUser: (userData: { name: string, email: string, role: UserRole, id: string, businessId?: string }) => Promise<void>;
    register: (email: string, password: string, userData: Omit<User, 'id'>) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => { },
    loginWithGoogle: async () => { },
    loginAsUser: async () => { },
    register: async () => { },
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        console.log('[AuthProvider] Initializing Firebase Auth...');

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log('[AuthProvider] Auth state changed:', firebaseUser ? 'User signed in' : 'User signed out');

            if (firebaseUser) {
                try {
                    // 1. Try to get user data from Firestore first (for email/password users)
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

                    if (userDoc.exists()) {
                        const data = userDoc.data() as User;
                        // Check if whitelisted for SuperAdmin (even if Firestore says otherwise)
                        const isWhitelisted = SUPERADMIN_EMAILS.includes(firebaseUser.email?.toLowerCase() || '');
                        if (isWhitelisted && data.role !== 'SuperAdmin') {
                            data.role = 'SuperAdmin';
                        }
                        setUser({ ...data, id: firebaseUser.uid });
                        console.log('[AuthProvider] User loaded from Firestore:', data.email, 'Role:', data.role);
                    } else {
                        // Check if whitelisted for SuperAdmin for new users
                        const isWhitelisted = SUPERADMIN_EMAILS.includes(firebaseUser.email?.toLowerCase() || '');
                        if (isWhitelisted) {
                            const superAdminUser: User = {
                                id: firebaseUser.uid,
                                name: firebaseUser.displayName || 'SuperAdmin',
                                email: firebaseUser.email!,
                                role: 'SuperAdmin',
                                username: firebaseUser.email!.split('@')[0],
                                status: 'Active',
                                businessId: null,
                                privileges: {
                                    canManageRegister: true,
                                    modules: []
                                }
                            };
                            setUser(superAdminUser);
                            console.log('[AuthProvider] Whitelisted SuperAdmin loaded from email:', firebaseUser.email);
                        } else {
                            // 2. Fallback to localStorage for anonymous POS users
                            const savedUser = localStorage.getItem('erp-user');
                            if (savedUser) {
                                const parsedUser = JSON.parse(savedUser);
                                setUser({
                                    ...parsedUser,
                                    id: firebaseUser.uid
                                });
                                console.log('[AuthProvider] User restored from localStorage:', parsedUser.email);
                            } else {
                                // 3. Absolute fallback
                                setUser({
                                    id: firebaseUser.uid,
                                    name: firebaseUser.displayName || 'Anonymous User',
                                    email: firebaseUser.email || 'anon@example.com',
                                    role: 'Cashier',
                                    username: 'anonymous',
                                    status: 'Active',
                                    businessId: null
                                });
                            }
                        }
                    }
                } catch (e) {
                    console.error('[AuthProvider] Error fetching user data:', e);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Login failed", error);
            setLoading(false);
            throw error;
        }
    };

    const loginWithGoogle = async (asSuperAdmin: boolean = false) => {
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user;

            if (asSuperAdmin) {
                // Create or update user document as SuperAdmin
                const userRef = doc(db, 'users', firebaseUser.uid);
                await setDoc(userRef, {
                    email: firebaseUser.email,
                    name: firebaseUser.displayName || 'SuperAdmin',
                    username: firebaseUser.email?.split('@')[0] || 'superadmin',
                    role: 'SuperAdmin',
                    status: 'Active',
                    businessId: null,
                    privileges: {
                        canManageRegister: true,
                        modules: []
                    }
                }, { merge: true });
                console.log('[AuthProvider] SuperAdmin user created/updated in Firestore');
            }
            // Auth state listener will handle the rest
        } catch (error) {
            console.error("Google login failed", error);
            setLoading(false);
            throw error;
        }
    };

    const loginAsUser = async (userData: { name: string, email: string, role: UserRole, id: string, businessId?: string }) => {
        setLoading(true);
        try {
            await signInAnonymously(auth);
            localStorage.setItem('erp-user', JSON.stringify(userData));
            // Auth state listener will handle the rest
        } catch (error) {
            console.error("Anonymous login failed", error);
            setLoading(false);
            throw error;
        }
    };

    const register = async (email: string, password: string, userData: Omit<User, 'id'>) => {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            await updateProfile(firebaseUser, { displayName: userData.name });

            // Save to Firestore
            await setDoc(doc(db, 'users', firebaseUser.uid), {
                ...userData,
                id: firebaseUser.uid
            });

        } catch (error) {
            console.error("Registration failed", error);
            setLoading(false);
            throw error;
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

    const value = { user, loading, login, loginWithGoogle, loginAsUser, register, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
