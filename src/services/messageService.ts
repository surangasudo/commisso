
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    orderBy,
    limit,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState } from 'react';

export type SystemMessage = {
    id: string;
    content: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'promo';
    target: 'all' | 'pos_only' | 'customer_display_only';
    isActive: boolean;
    createdAt: any;
    expiresAt?: any;
    createdBy: string;
};

export const broadcastMessage = async (message: {
    content: string;
    type: SystemMessage['type'];
    target: SystemMessage['target'];
    durationMinutes?: number;
    createdBy: string;
}) => {
    try {
        const messagesRef = collection(db, 'system_messages');
        const now = new Date();
        const expiresAt = message.durationMinutes
            ? Timestamp.fromDate(new Date(now.getTime() + message.durationMinutes * 60000))
            : null;

        await addDoc(messagesRef, {
            ...message,
            isActive: true,
            createdAt: serverTimestamp(),
            expiresAt: expiresAt
        });
        return { success: true };
    } catch (error) {
        console.error("Error broadcasting message:", error);
        throw error;
    }
};

export const useSystemMessages = (target: 'pos' | 'customer_display') => {
    const [lastMessage, setLastMessage] = useState<SystemMessage | null>(null);

    useEffect(() => {
        const messagesRef = collection(db, 'system_messages');

        // Listen for recent active messages targeting this client or 'all'
        // We order by createdAt desc to get the latest
        const q = query(
            messagesRef,
            where('isActive', '==', true),
            where('target', 'in', ['all', target === 'pos' ? 'pos_only' : 'customer_display_only']),
            orderBy('createdAt', 'desc'),
            limit(1)
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    const data = doc.data();

                    // Client-side expiry check
                    if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
                        return;
                    }

                    setLastMessage({ id: doc.id, ...data } as SystemMessage);
                }
            },
            (error) => {
                console.warn("System message listener failed (likely missing index). UI will continue without messaging.", error);
            }
        );

        return () => unsubscribe();
    }, [target]);

    return lastMessage;
};
