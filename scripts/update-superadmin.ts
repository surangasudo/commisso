/**
 * Script to update a user's role to SuperAdmin in Firestore.
 * Run with: npx tsx scripts/update-superadmin.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyBBB5Sl3XmcRjMLBoTkNCeRn9xQgCuj5E0',
    authDomain: 'commisso.firebaseapp.com',
    projectId: 'commisso',
    storageBucket: 'commisso.firebasestorage.app',
    messagingSenderId: '297541340555',
    appId: '1:297541340555:web:7130bc6caa8e2d6743f38e'
};

const USER_ID = '3ZUr760NhnhcPb1QrSYBwkjJdkp1'; // surangasudo@gmail.com

async function updateSuperadminRole() {
    console.log('Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const userRef = doc(db, 'users', USER_ID);

    console.log('Fetching current user data...');
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        console.error('User document not found!');
        process.exit(1);
    }

    console.log('Current user data:', userDoc.data());

    console.log('Updating user to SuperAdmin role...');
    await updateDoc(userRef, {
        role: 'SuperAdmin',
        status: 'Active',
        username: 'surangasudo',
        name: 'Suranga Sudo',
        businessId: null, // SuperAdmins don't belong to a specific business
        privileges: {
            canManageRegister: true,
            modules: [] // SuperAdmins have access to all modules
        }
    });

    console.log('✅ User role updated to SuperAdmin successfully!');

    // Verify
    const updatedDoc = await getDoc(userRef);
    console.log('Updated user data:', updatedDoc.data());

    process.exit(0);
}

updateSuperadminRole().catch(console.error);
