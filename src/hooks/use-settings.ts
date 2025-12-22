
'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Define comprehensive types for all settings
const initialSettings = {
    business: {
        businessName: 'Crimson POS',
        startDate: '2018-01-01',
        profitPercent: '25.00',
        currency: 'usd',
        currencyPlacement: 'before' as 'before' | 'after',
        timeZone: 'America/Phoenix',
        logo: null as string | null,
        fyStartMonth: 'january',
        stockAccountingMethod: 'fifo' as 'fifo' | 'lifo',
        transactionEditDays: '30',
        dateFormat: 'mmddyyyy',
        timeFormat: '24-hour' as '12-hour' | '24-hour',
        currencyPrecision: '2',
        quantityPrecision: '2',
    },
    tax: {
        taxNumber1: 'GSTIN12345',
        taxNumber2: '',
        enableInlineTax: true,
        defaultSalesTax: 'tax-2',
    },
    product: {
        skuPrefix: 'AS',
        enableBrands: true,
        enablePriceAndTax: true,
        enableRacks: false,
        enableWarranty: false,
        enableProductExpiry: false,
        addItemExpiry: '',
        onExpiryAction: 'keep_selling',
        onExpiryPeriod: '0',
        enableCategories: true,
        defaultUnit: '',
        enableRow: false,
        isProductImageRequired: false,
        enableSubCategories: true,
        enableSubUnits: false,
        enablePosition: false,
    },
    contact: {
        defaultCreditLimit: '1000',
        contactIdPrefix: 'CN',
        defaultPayTermValue: '30',
        defaultPayTermUnit: 'days',
    },
    sale: {
        defaultSaleDiscount: '0',
        defaultSellingPriceGroup: 'default',
        enableCommissionAgent: false,
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
        commissionCategoryRule: 'fallback' as 'strict' | 'fallback',
        requireCustomerForCreditSale: false,
        requireCommissionAgentForCreditSale: false,
    },
    pos: {
        expressCheckout: 'shift+e',
        payAndCheckout: 'shift+p',
        draftShortcut: 'shift+d',
        cancelShortcut: 'shift+c',
        goToQuantity: 'f2',
        weighingScaleShortcut: '',
        editDiscount: 'shift+i',
        editOrderTax: 'shift+t',
        addPaymentRow: 'shift+r',
        finalizePayment: 'shift+f',
        addNewProduct: 'f4',
        disableMultiplePay: false,
        dontShowProductSuggestion: false,
        disableOrderTax: false,
        enableTransactionDate: true,
        isServiceStaffRequired: true,
        showInvoiceScheme: false,
        showPricingTooltip: false,
        disableDraft: false,
        dontShowRecentTransactions: false,
        subtotalEditable: false,
        disableCreditSaleButton: false,
        enableServiceStaffInProductLine: false,
        enableWeighingScale: false,
        showInvoiceLayoutDropdown: false,
        printInvoiceOnSuspend: false,
        disableExpressCheckout: false,
        disableDiscount: false,
        disableSuspendSale: false,
        weighingScalePrefix: '',
        weighingScaleSkuLength: '5',
        weighingScaleQtyIntegerLength: '4',
        weighingScaleQtyFractionalLength: '3',
    },
    purchase: {
        enableEditingProductPrice: true,
        enablePurchaseStatus: true,
        enableLotNumber: false,
        enablePurchaseOrder: false,
        enablePurchaseRequisition: false,
    },
    payment: {
        cashDenominations: '10, 20, 50, 100, 200, 500, 2000',
        enableOn: 'all_screens',
        enableForMethods: '',
        strictCheck: false,
        cardPaymentMethod: 'manual' as 'manual' | 'manual_entry' | 'stripe' | 'paypal',
        enableStripe: false,
        stripePublicKey: '',
        stripeSecretKey: '',
        enablePaypal: false,
        paypalMode: 'sandbox' as 'sandbox' | 'live',
        paypalClientId: '',
        paypalClientSecret: '',
    },
    dashboard: {
        viewStockExpiryAlert: '30',
        enableStockExpiryAlert: true,
    },
    system: {
        appName: 'Crimson POS',
        helpLink: 'https://ultimatepos.com/docs',
        googleApiKey: '',
        isGoogleDriveEnabled: false,
        googleDriveAppId: '',
        enableRepairModule: true,
        themeColor: 'blue',
        defaultDatatableEntries: '25',
        showHelpText: true,
    },
    invoice: {
        invoiceLayout: 'default',
        invoiceScheme: 'default',
        design: 'classic' as 'classic' | 'modern', // classic = thermal, modern = A4
        showBusinessName: true,
        showLocationName: true,
        invoiceHeading: 'Invoice',
        footerText: 'Thank you for your business!',
        showLogo: true,
        logoSize: 100,
        showMobileNumber: true,
        showAlternateContactNumber: false,
        showEmail: true,
        showTaxNumber: true,
        showQrCode: false,
        showTax1: true,
        showTax2: false,
        showLandmark: true,
        showCity: true,
        showState: true,
        showZipCode: true,
        showCountry: true,
        showAlternateNumber: false,
    },
    prefixes: {
        purchase: 'PO',
        purchaseReturn: '',
        purchaseRequisition: '',
        purchaseOrder: '',
        stockTransfer: 'ST',
        stockAdjustment: 'SA',
        sellReturn: 'CN',
        expenses: 'EP',
        contacts: 'CO',
        purchasePayment: 'PP',
        sellPayment: 'SP',
        expensePayment: '',
        businessLocation: 'BL',
        username: '',
        subscriptionNo: '',
        draft: '',
        salesOrder: '',
    },
    email: {
        mailDriver: 'smtp',
        host: 'smtp.mailgun.org',
        port: '587',
        username: 'postmaster@sandbox.mailgun.org',
        password: '',
        encryption: 'tls',
        fromAddress: 'hello@example.com',
        fromName: 'Awesome Shop',
    },
    sms: {
        smsService: 'textlk' as 'textlk', // Only Text.lk is supported now
        textlkApiKey: '',
        textlkSenderId: '',
        enableSmsOnSale: false,
        smsTemplate: 'Dear {name}, thank you for your purchase of {amount} at {business}. Invoice: {invoice}',
    },
    rewardPoint: {
        enableRewardPoint: true,
        rewardPointDisplayName: 'Reward Points',
        amountForOnePoint: '10',
        minOrderTotalToEarn: '100',
        maxPointsPerOrder: '500',
        redeemAmountPerPoint: '1',
        minOrderTotalToRedeem: '200',
        minRedeemPointPerOrder: '50',
        maxRedeemPointPerOrder: '1000',
        expiryPeriod: '365',
        expiryPeriodType: 'days',
    },
    exchange: {
        rateMarkupPercent: '0.5',
    },
    modules: {
        serviceStaff: true,
        bookings: false,
        kitchen: false,
        subscription: false,
        typesOfService: false,
        tables: false,
        modifiers: false,
        account: true,
        advancedCommission: true,
    },
    customLabels: {
        contacts: { cf1: '', cf2: '', cf3: '', cf4: '', cf5: '', cf6: '', cf7: '', cf8: '', cf9: '', cf10: '' },
        products: { cf1: '', cf2: '', cf3: '', cf4: '' },
        locations: { cf1: '', cf2: '', cf3: '', cf4: '' },
        users: { cf1: '', cf2: '', cf3: '', cf4: '' },
        purchase: { cf1: '', cf2: '', cf3: '', cf4: '' },
        sell: { cf1: '', cf2: '', cf3: '', cf4: '' },
        shipping: { cf1: '', cf2: '', cf3: '', cf4: '', cf5: '' },
        typesOfService: { cf1: '', cf2: '', cf3: '', cf4: '', cf5: '', cf6: '' },
    },
};

export type AllSettings = typeof initialSettings;

type SettingsContextType = {
    settings: AllSettings;
    updateSection: <T extends keyof AllSettings>(section: T, newValues: Partial<AllSettings[T]>) => void;
};

const SettingsContext = createContext<SettingsContextType>({
    settings: initialSettings,
    updateSection: () => { },
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [settings, setSettings] = useState<AllSettings>(initialSettings);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadSettings = () => {
            try {
                const savedSettings = localStorage.getItem('businessSettings');
                if (savedSettings) {
                    const parsed = JSON.parse(savedSettings);
                    const mergedSettings = { ...initialSettings };
                    for (const key in initialSettings) {
                        if (parsed[key]) {
                            mergedSettings[key as keyof AllSettings] = {
                                ...initialSettings[key as keyof AllSettings],
                                ...parsed[key]
                            };
                        }
                    }
                    setSettings(mergedSettings);
                }
            } catch (error) {
                console.error("Failed to parse settings from localStorage", error);
            } finally {
                setIsLoaded(true);
            }
        };

        loadSettings();

        // Cross-tab synchronization
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'businessSettings' && e.newValue) {
                try {
                    const parsed = JSON.parse(e.newValue);
                    setSettings(parsed);
                } catch (err) {
                    console.error("Failed to sync settings across tabs", err);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('businessSettings', JSON.stringify(settings));
            // Apply theme class
            document.documentElement.classList.forEach(c => {
                if (c.startsWith('theme-')) {
                    document.documentElement.classList.remove(c);
                }
            });
            document.documentElement.classList.add(`theme-${settings.system.themeColor}`);
        }
    }, [settings, isLoaded]);

    const handleUpdateSection = useCallback(<T extends keyof AllSettings>(section: T, newValues: Partial<AllSettings[T]>) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                ...newValues,
            }
        }));
    }, []);

    const value = { settings, updateSection: handleUpdateSection };

    return React.createElement(SettingsContext.Provider, { value }, children);
};
