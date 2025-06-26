
'use client';

import { useSettings } from '@/hooks/use-settings';

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
    const { settings } = useSettings();

    const currencyCode = settings.business.currency || 'usd';
    const placement = settings.business.currencyPlacement || 'before';
    const symbol = getCurrencySymbol(currencyCode);

    const formatCurrency = (value: number) => {
        if (typeof value !== 'number') {
            value = 0;
        }
        if (placement === 'after') {
            return `${value.toFixed(2)} ${symbol}`;
        }
        return `${symbol}${value.toFixed(2)}`;
    };

    return { symbol, placement, formatCurrency };
};
