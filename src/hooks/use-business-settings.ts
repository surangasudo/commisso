
'use client';
import { useState, useEffect, useCallback } from 'react';

// Define a type for the settings we care about on the POS page.
type SaleSettings = {
    enableCommissionAgent: boolean;
    defaultSaleDiscount: string;
    defaultSellingPriceGroup: string;
    isCommissionAgentPhoneCompulsory: boolean;
    commissionAgent: string;
    commissionCalculationType: string;
    itemAdditionMethod: string;
    amountRoundingMethod: string;
    enableSalesOrder: boolean;
    enableRecurringInvoice: boolean;
    isPayTermRequired: boolean;
    isStripeEnabled: boolean;
    stripePublicKey: string;
    stripeSecretKey: string;
    isRazorpayEnabled: boolean;
    razorpayKeyId: string;
    razorpayKeySecret: string;
    allowOverselling: boolean;
};

const defaultSaleSettings: SaleSettings = {
    enableCommissionAgent: false,
    defaultSaleDiscount: '0',
    defaultSellingPriceGroup: 'default',
    isCommissionAgentPhoneCompulsory: false,
    commissionAgent: 'none',
    commissionCalculationType: 'invoice_value',
    itemAdditionMethod: 'increase_quantity',
    amountRoundingMethod: 'round_to_nearest_whole',
    enableSalesOrder: false,
    enableRecurringInvoice: false,
    isPayTermRequired: false,
    isStripeEnabled: false,
    stripePublicKey: '',
    stripeSecretKey: '',
    isRazorpayEnabled: false,
    razorpayKeyId: '',
    razorpayKeySecret: '',
    allowOverselling: false,
};

type BusinessSettings = {
    sale: SaleSettings;
};

const defaultBusinessSettings: BusinessSettings = {
    sale: defaultSaleSettings,
};

export const useBusinessSettings = () => {
    const [settings, setSettings] = useState<BusinessSettings>(defaultBusinessSettings);

    const loadSettings = useCallback(() => {
        try {
            const savedSettings = localStorage.getItem('businessSettings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                // Merge loaded settings with defaults to ensure all keys are present
                const newSaleSettings = { ...defaultSaleSettings, ...(parsed.sale || {}) };
                setSettings({ sale: newSaleSettings });
            } else {
                setSettings(defaultBusinessSettings);
            }
        } catch (error) {
            console.error("Failed to read business settings from localStorage", error);
            setSettings(defaultBusinessSettings);
        }
    }, []);

    useEffect(() => {
        loadSettings();
        
        const handleSettingsUpdate = () => {
            loadSettings();
        };
        
        // Listen for changes from other tabs
        window.addEventListener('storage', handleSettingsUpdate);
        // Listen for changes from the settings page in the same tab
        window.addEventListener('settingsUpdated', handleSettingsUpdate);

        return () => {
            window.removeEventListener('storage', handleSettingsUpdate);
            window.removeEventListener('settingsUpdated', handleSettingsUpdate);
        };
    }, [loadSettings]);

    return settings;
};
