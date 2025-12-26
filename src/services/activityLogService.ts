import { db } from '@/lib/firebase';
import {
    collection,
    getDocs,
    getDoc,
    addDoc,
    doc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    onSnapshot,
    Timestamp,
    QueryConstraint,
    DocumentSnapshot,
} from 'firebase/firestore';
import { type SuperadminActivityLog } from '@/lib/data';

const COLLECTION_NAME = 'activity_logs';

export type ActivityLogFilters = {
    dateFrom?: Date;
    dateTo?: Date;
    userId?: string;
    logType?: SuperadminActivityLog['logType'] | 'all';
    action?: SuperadminActivityLog['action'] | 'all';
    status?: SuperadminActivityLog['status'] | 'all';
    searchTerm?: string;
};

export type PaginationOptions = {
    pageSize: number;
    lastDoc?: DocumentSnapshot;
};

export type SortOptions = {
    field: keyof SuperadminActivityLog;
    direction: 'asc' | 'desc';
};

// Convert Firestore document to SuperadminActivityLog
const docToActivityLog = (doc: DocumentSnapshot): SuperadminActivityLog => {
    const data = doc.data();
    if (!data) {
        throw new Error('Document data is undefined');
    }
    return {
        id: doc.id,
        timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp),
        userId: data.userId || '',
        userName: data.userName || '',
        userEmail: data.userEmail || '',
        action: data.action || 'Create',
        logType: data.logType || 'Settings',
        entity: data.entity || '',
        entityId: data.entityId || '',
        status: data.status || 'Info',
        details: data.details || '',
        metadata: data.metadata || undefined,
    };
};

// Get activity logs with filters and pagination
export async function getActivityLogs(
    filters: ActivityLogFilters = {},
    pagination: PaginationOptions = { pageSize: 25 },
    sort: SortOptions = { field: 'timestamp', direction: 'desc' }
): Promise<{ logs: SuperadminActivityLog[]; lastDoc: DocumentSnapshot | null; total: number }> {
    try {
        const constraints: QueryConstraint[] = [];

        // Date filters
        if (filters.dateFrom) {
            constraints.push(where('timestamp', '>=', Timestamp.fromDate(filters.dateFrom)));
        }
        if (filters.dateTo) {
            constraints.push(where('timestamp', '<=', Timestamp.fromDate(filters.dateTo)));
        }

        // User filter
        if (filters.userId && filters.userId !== 'all') {
            constraints.push(where('userId', '==', filters.userId));
        }

        // Log type filter
        if (filters.logType && filters.logType !== 'all') {
            constraints.push(where('logType', '==', filters.logType));
        }

        // Action filter
        if (filters.action && filters.action !== 'all') {
            constraints.push(where('action', '==', filters.action));
        }

        // Status filter
        if (filters.status && filters.status !== 'all') {
            constraints.push(where('status', '==', filters.status));
        }

        // Sorting
        constraints.push(orderBy(sort.field, sort.direction));

        // Pagination
        constraints.push(limit(pagination.pageSize));
        if (pagination.lastDoc) {
            constraints.push(startAfter(pagination.lastDoc));
        }

        const q = query(collection(db, COLLECTION_NAME), ...constraints);
        const querySnapshot = await getDocs(q);

        const logs = querySnapshot.docs.map(docToActivityLog);

        // Apply search filter client-side (Firestore doesn't support full-text search)
        const filteredLogs = filters.searchTerm
            ? logs.filter(
                (log) =>
                    log.entity.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
                    log.details.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
                    log.userName.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
                    log.action.toLowerCase().includes(filters.searchTerm!.toLowerCase())
            )
            : logs;

        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

        // Get total count (approximate - Firestore doesn't have efficient count)
        const totalQuery = query(collection(db, COLLECTION_NAME));
        const totalSnapshot = await getDocs(totalQuery);

        return {
            logs: filteredLogs,
            lastDoc,
            total: totalSnapshot.size,
        };
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        return { logs: [], lastDoc: null, total: 0 };
    }
}

// Get a single activity log by ID
export async function getActivityLog(id: string): Promise<SuperadminActivityLog | null> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return null;
        return docToActivityLog(docSnap);
    } catch (error) {
        console.error('Error fetching activity log:', error);
        return null;
    }
}

// Subscribe to real-time activity log updates
export function subscribeToActivityLogs(
    callback: (logs: SuperadminActivityLog[]) => void,
    filters: ActivityLogFilters = {},
    sort: SortOptions = { field: 'timestamp', direction: 'desc' },
    pageSize: number = 25
): () => void {
    const constraints: QueryConstraint[] = [];

    // Date filters
    if (filters.dateFrom) {
        constraints.push(where('timestamp', '>=', Timestamp.fromDate(filters.dateFrom)));
    }
    if (filters.dateTo) {
        constraints.push(where('timestamp', '<=', Timestamp.fromDate(filters.dateTo)));
    }

    // User filter
    if (filters.userId && filters.userId !== 'all') {
        constraints.push(where('userId', '==', filters.userId));
    }

    // Log type filter
    if (filters.logType && filters.logType !== 'all') {
        constraints.push(where('logType', '==', filters.logType));
    }

    // Action filter
    if (filters.action && filters.action !== 'all') {
        constraints.push(where('action', '==', filters.action));
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
        constraints.push(where('status', '==', filters.status));
    }

    // Sorting and limit
    constraints.push(orderBy(sort.field, sort.direction));
    constraints.push(limit(pageSize));

    const q = query(collection(db, COLLECTION_NAME), ...constraints);

    const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
            const logs = snapshot.docs.map(docToActivityLog);

            // Apply search filter client-side
            const filteredLogs = filters.searchTerm
                ? logs.filter(
                    (log) =>
                        log.entity.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
                        log.details.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
                        log.userName.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
                        log.action.toLowerCase().includes(filters.searchTerm!.toLowerCase())
                )
                : logs;

            callback(filteredLogs);
        },
        (error) => {
            console.error('Error in activity logs subscription:', error);
        }
    );

    return unsubscribe;
}

// Add a new activity log
export async function addActivityLog(
    log: Omit<SuperadminActivityLog, 'id'>
): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...log,
            timestamp: Timestamp.fromDate(log.timestamp),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding activity log:', error);
        throw error;
    }
}

// Helper function to log an activity
export async function logActivity(
    user: { id: string; name: string; email: string },
    action: SuperadminActivityLog['action'],
    logType: SuperadminActivityLog['logType'],
    entity: string,
    entityId: string,
    status: SuperadminActivityLog['status'],
    details: string,
    metadata?: SuperadminActivityLog['metadata']
): Promise<string> {
    return addActivityLog({
        timestamp: new Date(),
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        action,
        logType,
        entity,
        entityId,
        status,
        details,
        metadata,
    });
}
