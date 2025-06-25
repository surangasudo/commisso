/**
 * Sanitizes data from Firestore to be client-safe.
 * This function uses a JSON cycle (`JSON.parse(JSON.stringify(data))`)
 * to force the conversion of any non-serializable data types (like Firestore Timestamps)
 * into plain, serializable formats. This is a robust way to ensure data can be safely
 * passed from Server Components to Client Components in Next.js.
 *
 * @param data The data to be sanitized.
 * @returns A fully sanitized, serializable object.
 */
export function sanitizeForClient<T>(data: any): T {
  // A JSON cycle is a robust way to strip any non-serializable properties
  // like class instances, functions, or complex objects like Timestamps,
  // ensuring the final object is plain and safe to pass to Client Components.
  return JSON.parse(JSON.stringify(data));
}
