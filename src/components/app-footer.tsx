'use client';
import { useSettings } from '@/hooks/use-settings';

export const AppFooter = () => {
    const { appName } = useSettings();

    return (
        <div className="text-center text-xs text-slate-400 p-1">
            {appName} - V6.7 | Copyright © 2025 All rights reserved.
        </div>
    );
};
