/**
 * @fileoverview Utilities for interacting with Firestore data,
 * ensuring it's safe to pass from Server to Client Components.
 */

/**
 * Sanitizes Firestore data to be client-safe by deep-cloning it through JSON serialization.
 * This is the most robust way to strip any non-serializable data, such as class instances
 * (like Timestamps) or functions, ensuring only plain objects are passed to client components.
 *
 * @param data The data to be sanitized (can be an object, array, or primitive).
 * @returns A fully sanitized, serializable object, array, or primitive.
 */
export function sanitizeForClient<T>(data: any): T {
    if (data === null || data === undefined) {
        return data;
    }
    // The JSON.stringify and JSON.parse trick is a reliable way to deep-clone
    // and remove any non-serializable properties (like methods or prototypes)
    // from an object, which is exactly what Next.js requires for props passed
    // from Server to Client Components.
    return JSON.parse(JSON.stringify(data));
}
