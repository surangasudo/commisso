/**
 * @fileoverview Utilities for interacting with Firestore data,
 * ensuring it's safe to pass from Server to Client Components.
 */
import { Timestamp } from 'firebase/firestore';

/**
 * Sanitizes Firestore data to be client-safe by converting Timestamps to ISO strings.
 * This function recursively traverses the data structure, ensuring only plain objects
 * and serializable data types are passed to client components.
 *
 * @param data The data to be sanitized (can be an object, array, or primitive).
 * @returns A fully sanitized, serializable object, array, or primitive.
 */
export function sanitizeForClient<T>(data: any): T {
    if (data === null || data === undefined) {
        return data;
    }

    // Handle Firestore Timestamps by converting them to ISO date strings
    if (data instanceof Timestamp) {
        return data.toDate().toISOString() as any;
    }

    // Handle Arrays by recursively sanitizing each item
    if (Array.isArray(data)) {
        return data.map(item => sanitizeForClient(item)) as any;
    }

    // Handle plain objects by recursively sanitizing their properties
    if (typeof data === 'object' && data.constructor === Object) {
        const newObj: { [key: string]: any } = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                newObj[key] = sanitizeForClient(data[key]);
            }
        }
        return newObj as T;
    }
    
    // Return primitives and other supported types as-is
    return data;
}
