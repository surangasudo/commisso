/**
 * @fileoverview Utilities for interacting with Firestore data,
 * ensuring it's safe to pass from Server to Client Components.
 */

/**
 * Sanitizes data from Firestore to be client-safe.
 * This is crucial because Firestore can return special data types (like Timestamps)
 * that are not plain objects and cannot be passed directly from Server to Client Components in Next.js.
 * This function uses a robust method to ensure any non-serializable properties are removed.
 *
 * @param data The data to be sanitized (can be an object, array, or primitive).
 * @returns A fully sanitized, serializable object, array, or primitive.
 */
export function sanitizeForClient<T>(data: any): T {
    // The JSON.stringify/parse trick is a robust way to strip non-serializable
    // properties (like class instances, functions, or undefined) from an object,
    // and it also correctly converts Firestore Timestamps to ISO date strings.
    // This is the most reliable way to prevent the "Only plain objects" error.
    if (data === null || data === undefined) {
        return data;
    }
    return JSON.parse(JSON.stringify(data));
}
