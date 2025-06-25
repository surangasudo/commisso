/**
 * @fileoverview Utilities for interacting with Firestore data,
 * ensuring it's safe to pass from Server to Client Components.
 */

/**
 * Sanitizes data from Firestore to be client-safe.
 * This is crucial because Firestore can return special data types (like Timestamps)
 * that are not plain objects and cannot be passed directly from Server to Client Components in Next.js.
 * This function uses JSON stringification and parsing, which is a robust method to
 * convert any serializable data into a plain, safe-to-pass format.
 * Firestore Timestamps are automatically converted to ISO date strings during this process.
 *
 * @param data The data to be sanitized (can be an object, array, or primitive).
 * @returns A fully sanitized, serializable object, array, or primitive.
 */
export function sanitizeForClient<T>(data: any): T {
    if (data === null || data === undefined) {
        return data;
    }
    // The JSON cycle is a robust way to strip any non-serializable properties
    // like class instances (e.g., Firestore Timestamps) or functions, ensuring the object is plain.
    return JSON.parse(JSON.stringify(data));
}
