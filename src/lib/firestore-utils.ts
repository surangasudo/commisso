/**
 * @fileoverview Utilities for interacting with Firestore data,
 * ensuring it's safe to pass from Server to Client Components.
 */

/**
 * Sanitizes data from Firestore to be client-safe.
 * This is crucial because Firestore can return special data types (like Timestamps)
 * that are not plain objects and cannot be passed directly from Server to Client Components in Next.js.
 * This function recursively walks through the data and converts any Firestore Timestamps to ISO date strings.
 *
 * @param data The data to be sanitized (can be an object, array, or primitive).
 * @returns A fully sanitized, serializable object, array, or primitive.
 */
export function sanitizeForClient<T>(data: any): T {
    if (data === null || data === undefined) {
        return data;
    }

    // Check if the data is a Firestore Timestamp by looking for the toDate method ("duck typing").
    // This is more reliable than `instanceof` in some environments.
    if (typeof data.toDate === 'function') {
        return data.toDate().toISOString();
    }

    if (Array.isArray(data)) {
        return data.map(item => sanitizeForClient(item)) as any;
    }

    if (typeof data === 'object' && data.constructor === Object) {
        const sanitizedObject: { [key: string]: any } = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                sanitizedObject[key] = sanitizeForClient(data[key]);
            }
        }
        return sanitizedObject as T;
    }
    
    // Return primitives and other types (like Date objects that are already client-safe) as is.
    return data;
}
