/**
 * @fileoverview Utilities for interacting with Firestore data,
 * ensuring it's safe to pass from Server to Client Components.
 */

// A type guard to check if a value is a Firestore-like Timestamp object.
// We use "duck typing" by checking for the toDate method, which is more
// reliable across different environments than `instanceof`.
function isTimestamp(value: any): value is { toDate: () => Date } {
  return value && typeof value.toDate === 'function';
}

/**
 * Recursively sanitizes data from Firestore to be client-safe.
 * This function iterates through objects and arrays, specifically converting
 * Firestore Timestamp objects into ISO 8601 date strings.
 *
 * @param data The data to be sanitized (can be an object, array, or primitive).
 * @returns A fully sanitized, serializable object, array, or primitive.
 */
export function sanitizeForClient<T>(data: any): T {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  // Handle Firestore Timestamps
  if (isTimestamp(data)) {
    return data.toDate().toISOString() as any;
  }

  // Handle Arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForClient(item)) as any;
  }

  // Handle Objects
  const sanitizedObject: { [key: string]: any } = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      sanitizedObject[key] = sanitizeForClient(data[key]);
    }
  }
  
  return sanitizedObject as T;
}
