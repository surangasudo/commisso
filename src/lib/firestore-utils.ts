/**
 * @fileoverview Utilities for interacting with Firestore data,
 * ensuring it's safe to pass from Server to Client Components.
 */

/**
 * Sanitizes data from Firestore to be client-safe by converting it to JSON
 * and back. This is a robust way to strip any non-serializable properties
 * (like class instances or functions) and convert Timestamps to strings.
 *
 * @param data The data to be sanitized (can be an object, array, or primitive).
 * @returns A fully sanitized, serializable object, array, or primitive.
 */
export function sanitizeForClient<T>(data: any): T {
    if (!data) {
        return data;
    }
    // This is a simple but effective way to ensure data is serializable.
    // It converts Timestamps to ISO strings and removes any class instances.
    return JSON.parse(JSON.stringify(data));
}
