/**
 * @fileoverview Utilities for interacting with Firestore data,
 * ensuring it's safe to pass from Server to Client Components.
 */

// This function recursively finds and converts Firestore Timestamps to ISO strings.
function convertTimestamps(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle Firestore Timestamps (and other date-like objects)
  if (typeof obj.toDate === 'function') {
    return obj.toDate().toISOString();
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(convertTimestamps);
  }

  // Handle objects
  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = convertTimestamps(obj[key]);
    }
  }

  return newObj;
}


/**
 * Sanitizes data from Firestore to be client-safe by converting Timestamps
 * and ensuring the object is plain.
 *
 * @param data The data to be sanitized (can be an object, array, or primitive).
 * @returns A fully sanitized, serializable object, array, or primitive.
 */
export function sanitizeForClient<T>(data: any): T {
    if (!data) {
        return data;
    }
    const sanitizedData = convertTimestamps(data);
    // The JSON cycle is a final, robust way to strip any remaining non-serializable properties
    // like class instances or functions, ensuring the object is plain.
    return JSON.parse(JSON.stringify(sanitizedData));
}
