
import { Timestamp } from 'firebase/firestore';

function isObject(item: any): item is Record<string, any> {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

// Recursively search for Timestamp objects and convert them to ISO strings.
function sanitizeData<T>(data: any): T {
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item)) as any;
  }

  if (data instanceof Timestamp) {
    return data.toDate().toISOString() as any;
  }

  if (isObject(data)) {
    const newObj: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
          newObj[key] = sanitizeData(data[key]);
      }
    }
    return newObj as T;
  }
  
  return data;
}

// Helper to process a single Firestore document.
export function processDoc<T>(doc: any): T {
  const data = doc.data();
  const sanitizedData = sanitizeData(data);
  return { id: doc.id, ...sanitizedData };
}
