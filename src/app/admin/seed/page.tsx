'use client';

import { useState } from 'react';
import { addProduct } from '@/services/productService';
import { addCustomer } from '@/services/customerService';
import { addProductCategory } from '@/services/productCategoryService';
import { addSale } from '@/services/saleService';
import { DetailedProduct, Customer, ProductCategory, Sale } from '@/lib/data';

export default function SeedPage() {
    const [status, setStatus] = useState('Idle');
    const [loading, setLoading] = useState(false);

    const handleSeed = async () => {
        setLoading(true);
        setStatus('Seeding...');
        try {
            // 1. Categories
            setStatus('Seeding Categories...');
            const cat1: Omit<ProductCategory, 'id'> = { name: 'Electronics', code: 'ELEC' };
            const cat2: Omit<ProductCategory, 'id'> = { name: 'Clothing', code: 'CLOTH' };
            await addProductCategory(cat1);
            await addProductCategory(cat2);

            // 2. Products
            setStatus('Seeding Products...');
            const prod1: Omit<DetailedProduct, 'id'> = {
                name: 'iPhone 15',
                sku: 'IP15',
                category: 'Electronics',
                brand: 'Apple',
                businessLocation: 'Awesome Shop',
                currentStock: 100,
                unitPurchasePrice: 800,
                sellingPrice: 1000,
                productType: 'Single',
                image: '',
                tax: 'None',
                unit: 'Piece'
            };
            const prod2: Omit<DetailedProduct, 'id'> = {
                name: 'T-Shirt',
                sku: 'TSHIRT',
                category: 'Clothing',
                brand: 'Generic',
                businessLocation: 'Awesome Shop',
                currentStock: 500,
                unitPurchasePrice: 10,
                sellingPrice: 25,
                productType: 'Single',
                image: '',
                tax: 'None',
                unit: 'Piece'
            };
            await addProduct(prod1);
            await addProduct(prod2);

            // 3. Customers
            setStatus('Seeding Customers...');
            const cust1: Omit<Customer, 'id'> = {
                name: 'John Doe',
                mobile: '555-0101',
                email: 'john@example.com',
                contactId: 'CUST-001',
                taxNumber: '',
                customerGroup: 'Retail',
                openingBalance: 0,
                addedOn: new Date().toISOString(),
                address: '123 Main St',
                totalSaleDue: 0,
                totalSaleReturnDue: 0
            };
            await addCustomer(cust1, 'CUS'); // Using prefix to generate ID

            setStatus('Seeding Complete! You can now check the Dashboard.');
        } catch (error: any) {
            console.error(error);
            setStatus(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Database Seeder</h1>
            <div className="mb-4 text-lg">Status: {status}</div>
            <button
                onClick={handleSeed}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                {loading ? 'Seeding...' : 'Seed Data'}
            </button>
        </div>
    );
}
