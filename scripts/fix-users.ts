/**
 * Script to fix user records in Firestore with missing required fields.
 * Run with: npx tsx scripts/fix-users.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyBBB5Sl3XmcRjMLBoTkNCeRn9xQgCuj5E0',
    authDomain: 'commisso.firebaseapp.com',
    projectId: 'commisso',
    storageBucket: 'commisso.firebasestorage.app',
    messagingSenderId: '297541340555',
    appId: '1:297541340555:web:7130bc6caa8e2d6743f38e'
};

async function fixUsers() {
    console.log('Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const usersCollection = collection(db, 'users');
    const snapshot = await getDocs(usersCollection);

    console.log(`Found ${snapshot.docs.length} users to check...`);

    for (const userDoc of snapshot.docs) {
        const data = userDoc.data();
        const userId = userDoc.id;

        console.log(`\nChecking user ${userId}:`, data);

        // Check if user is missing required fields
        if (!data.name || !data.role || !data.status) {
            console.log(`  → Fixing user ${data.email || userId}...`);

            // Determine the name from email or use a fallback
            const emailName = data.email ? data.email.split('@')[0] : 'User';
            const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);

            // Determine role - make first user SuperAdmin, others Admin
            const role = data.email === 'surangasudo@gmail.com' ? 'SuperAdmin' : 'Admin';

            const updates: any = {};

            if (!data.name) {
                updates.name = displayName;
            }
            if (!data.role) {
                updates.role = role;
            }
            if (!data.status) {
                updates.status = 'Active';
            }
            if (!data.username) {
                updates.username = emailName.toLowerCase();
            }
            if (data.businessId === undefined) {
                updates.businessId = role === 'SuperAdmin' ? null : 'default-business';
            }
            if (!data.privileges) {
                updates.privileges = {
                    canManageRegister: true,
                    modules: role === 'SuperAdmin' ? [] : ['commission', 'reports', 'expenses', 'payment-accounts', 'stock-transfers', 'stock-adjustment', 'multi-currency']
                };
            }

            console.log(`  → Applying updates:`, updates);

            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, updates);

            console.log(`  ✅ User ${data.email || userId} fixed!`);
        } else {
            console.log(`  → User already has required fields, skipping.`);
        }
    }

    console.log('\n✅ All users checked and fixed!');
    process.exit(0);
}

fixUsers().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
