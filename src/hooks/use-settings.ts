'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type SystemSettings = {
    appName: string;
    helpLink: string;
    themeColor: string;
};

const defaultSettings: SystemSettings = {
    appName: 'Awesome Shop',
    helpLink: 'https://ultimatepos.com/docs',
    themeColor: 'blue',
};

const SettingsContext = createContext<SystemSettings>(defaultSettings);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [settings, setSettings] = useState<SystemSettings>(defaultSettings);

    const loadAndApplySettings = useCallback(() => {
        try {
            const savedSettings = localStorage.getItem('businessSettings');
            let systemSettings = defaultSettings;
            
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                const system = parsed.system || {};
                systemSettings = {
                    appName: system.appName || defaultSettings.appName,
                    helpLink: system.helpLink || defaultSettings.helpLink,
                    themeColor: system.themeColor || defaultSettings.themeColor,
                };
            }
            
            setSettings(systemSettings);

            // Apply theme class
            document.documentElement.classList.forEach(c => {
                if (c.startsWith('theme-')) {
                    document.documentElement.classList.remove(c);
                }
            });
            document.documentElement.classList.add(`theme-${systemSettings.themeColor}`);

        } catch (error) {
            console.error("Failed to read system settings from localStorage", error);
        }
    }, []);

    useEffect(() => {
        loadAndApplySettings();
        
        window.addEventListener('storage', loadAndApplySettings);
        window.addEventListener('settingsUpdated', loadAndApplySettings);

        return () => {
            window.removeEventListener('storage', loadAndApplySettings);
            window.removeEventListener('settingsUpdated', loadAndApplySettings);
        };
    }, [loadAndApplySettings]);

    return React.createElement(SettingsContext.Provider, { value: settings }, children);
};
