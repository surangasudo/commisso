
'use client';
import { useState, useEffect, useCallback } from 'react';

const getCurrencySymbol = (currencyCode: string): string => {
    const currencyMap: { [key: string]: string } = {
        usd: '$', cad: '$', mxn: '$',
        eur: '€', gbp: '£', chf: 'CHF', sek: 'kr', nok: 'kr',
        jpy: '¥', cny: '¥', inr: '₹', sgd: 'S$', hkd: 'HK$', krw: '₩', lkr: 'Rs',
        aud: '$', nzd: '$',
        brl: 'R$', ars: '$', clp: '$',
        zar: 'R', ngn: '₦', kes: 'KSh'
    };
    return currencyMap[currencyCode.toLowerCase()] || '$';
};

type CurrencySettings = {
    symbol: string;
    placement: 'before' | 'after';
}

export const useCurrency = (): CurrencySettings & { formatCurrency: (value: number) => string } => {
    const [settings, setSettings] = useState<CurrencySettings>({ symbol: '$', placement: 'before' });

    const loadSettings = useCallback(() => {
        try {
            const savedSettings = localStorage.getItem('businessSettings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                const businessSettings = parsed.business || {};
                const currencyCode = businessSettings.currency || 'usd';
                const currencyPlacement = businessSettings.currencyPlacement || 'before';
                
                setSettings({
                    symbol: getCurrencySymbol(currencyCode),
                    placement: currencyPlacement,
                });
            } else {
                 setSettings({ symbol: '$', placement: 'before' });
            }
        } catch (error) {
            console.error("Failed to read currency from localStorage", error);
            setSettings({ symbol: '$', placement: 'before' });
        }
    }, []);

    useEffect(() => {
        loadSettings();

        const handleSettingsUpdate = () => {
            loadSettings();
        };

        window.addEventListener('storage', handleSettingsUpdate);
        window.addEventListener('settingsUpdated', handleSettingsUpdate);

        return () => {
            window.removeEventListener('storage', handleSettingsUpdate);
            window.removeEventListener('settingsUpdated', handleSettingsUpdate);
        };
    }, [loadSettings]);
    
    const formatCurrency = (value: number) => {
        if (typeof value !== 'number') {
            value = 0;
        }
        if (settings.placement === 'after') {
            return `${value.toFixed(2)} ${settings.symbol}`;
        }
        return `${settings.symbol}${value.toFixed(2)}`;
    };

    return { ...settings, formatCurrency };
};
