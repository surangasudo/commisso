'use server';

import { Timestamp } from 'firebase/firestore';

/**
 * Recursively converts Firestore Timestamps to ISO date strings within any object or array.
 * This is necessary to make data from Firestore serializable and safe to pass from
 * Server Components to Client Components in Next.js.
 * @param data The data to sanitize.
 * @returns The sanitized data.
 */
function convertTimestamps(data: any): any {
  if (data instanceof Timestamp) {
    return data.toDate().toISOString();
  }

  if (Array.isArray(data)) {
    return data.map(convertTimestamps);
  }

  if (data !== null && typeof data === 'object') {
    const sanitizedObject: { [key: string]: any } = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitizedObject[key] = convertTimestamps(data[key]);
      }
    }
    return sanitizedObject;
  }

  return data;
}

/**
 * Sanitizes data from Firestore to be client-safe. It converts Timestamps and
 * then performs a JSON cycle to ensure a plain object.
 * @param data The data to be sanitized.
 * @returns A fully sanitized, serializable object.
 */
export function sanitizeForClient<T>(data: any): T {
  const sanitizedData = convertTimestamps(data);
  // The JSON cycle is a robust way to strip any remaining non-serializable properties
  // like class instances or functions, ensuring the object is plain.
  return JSON.parse(JSON.stringify(sanitizedData));
}
