import { Timestamp } from 'firebase/firestore';

/**
 * Recursively converts Firestore Timestamps to ISO date strings within any object or array.
 * This is necessary to make data from Firestore serializable and safe to pass from
 * Server Components to Client Components in Next.js.
 * @param data The data to sanitize.
 * @returns The sanitized data.
 */
function sanitize(data: any): any {
  // Handle null, undefined, and non-objects
  if (data === null || typeof data !== 'object') {
    return data;
  }

  // Duck-type for Firestore Timestamp. This is more robust than `instanceof`.
  // Checks if the object has a toDate method, which is characteristic of Timestamps.
  if (typeof data.toDate === 'function') {
    return data.toDate().toISOString();
  }

  // Handle Arrays by mapping over each item and sanitizing it.
  if (Array.isArray(data)) {
    return data.map(item => sanitize(item));
  }
  
  // Handle plain objects. We create a new plain object {} to ensure it has a standard prototype.
  const newObj: { [key: string]: any } = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      newObj[key] = sanitize(data[key]);
    }
  }
  return newObj;
}

/**
 * Sanitizes data from Firestore to be client-safe. It converts Timestamps and
 * ensures the returned object is a plain JavaScript object with a standard prototype.
 * @param data The data to be sanitized.
 * @returns A fully sanitized, serializable object.
 */
export function sanitizeForClient<T>(data: any): T {
  return sanitize(data);
}
