'use client';
import { useSettings } from '@/hooks/use-settings';

export const AppFooter = () => {
    const { settings } = useSettings();
    const appName = settings.system.appName;

    return (
        <div className="text-center text-xs text-slate-400 p-1">
            {appName} | Copyright © 2025 All rights reserved.
        </div>
    );
};
