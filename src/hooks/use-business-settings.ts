
'use client';
import { useSettings } from '@/hooks/use-settings';

export const useBusinessSettings = () => {
    const { settings } = useSettings();
    return settings;
};
