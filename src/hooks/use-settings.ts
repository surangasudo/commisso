
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
    notificationTemplates: {
        notifications: {
            sendLedger: {
                emailSubject: "Ledger from {business_name}",
                emailBody: "",
                smsBody: "",
                whatsappText: "",
                cc: '',
                bcc: '',
            },
        },
        customer: {
            newSale: {
                emailSubject: "Thank you from {business_name}",
                emailBody: "Dear {contact_name},\n\nYour invoice number is {invoice_number}\nTotal amount: {total_amount}\nPaid amount: {received_amount}\n\nThank you for shopping with us.\n\n{business_logo}",
                smsBody: "Dear {contact_name}, Thank you for shopping at {business_name}.",
                whatsappText: "Dear {contact_name}, Thank you for shopping at {business_name}.",
                cc: '',
                bcc: '',
            },
            paymentReceived: { emailSubject: "Payment Received", emailBody: "Dear {contact_name}, We have received a payment of {paid_amount} against invoice {invoice_number}. Thank you.", smsBody: "", whatsappText: "", cc: '', bcc: '' },
            paymentReminder: { emailSubject: "Payment Reminder", emailBody: "Dear {contact_name}, This is a reminder for your due payment of {due_amount} for invoice {invoice_number}.", smsBody: "", whatsappText: "", cc: '', bcc: '' },
            newBooking: { emailSubject: "New Booking Confirmation", emailBody: "Dear {contact_name}, Your booking for invoice {invoice_number} is confirmed.", smsBody: "", whatsappText: "", cc: '', bcc: '' },
            newQuotation: { emailSubject: "New Quotation", emailBody: "Dear {contact_name}, Here is your quotation for invoice {invoice_number}.", smsBody: "", whatsappText: "", cc: '', bcc: '' },
            autoEmail: false,
            autoSms: false,
            autoWhatsapp: false,
        },
        supplier: {
            newOrder: {
                emailSubject: "New Order from {business_name}",
                emailBody: "Dear {contact_name},\n\nWe have a new order with reference number {order_ref_number}. Kindly process the products as soon as possible.\n\n{business_name}\n{business_logo}",
                smsBody: "Dear {contact_name}, We have a new order with reference number {order_ref_number}. Kindly process the products as soon as possible. {business_name}",
                whatsappText: "Dear {contact_name}, We have a new order with reference number {order_ref_number}. Kindly process the products as soon as possible. {business_name}",
                cc: '',
                bcc: '',
            },
            paymentPaid: { emailSubject: "Payment Paid", emailBody: "", smsBody: "", whatsappText: "", cc: '', bcc: '' },
            itemsReceived: { emailSubject: "Items Received", emailBody: "", smsBody: "", whatsappText: "", cc: '', bcc: '' },
            itemsPending: { emailSubject: "Items Pending", emailBody: "", smsBody: "", whatsappText: "", cc: '', bcc: '' },
            purchaseOrder: { emailSubject: "Purchase Order", emailBody: "", smsBody: "", whatsappText: "", cc: '', bcc: '' },
            autoEmail: false,
            autoSms: false,
            autoWhatsapp: false,
        },
        salesRepresentative: {
            agentCommission: {
                emailSubject: "Your Agent Commission Statement from {business_name}",
                emailBody: "Dear {representative_name},\n\nYou have received a commission payment of {commission_amount} from {business_name}.\n\n{commission_details}\n\nThank you.",
                smsBody: "Thank you for visiting {business_name}. Your commission of {commission_amount} has been paid. Details: {commission_details}",
                whatsappText: "Dear {representative_name}, your Agent commission of {commission_amount} has been paid. Thanks, {business_name}. Details: {commission_details}",
                cc: '',
                bcc: '',
            },
            subAgentCommission: {
                emailSubject: "Your Sub-Agent Commission Statement from {business_name}",
                emailBody: "Dear {representative_name},\n\nYour commission as a Sub-Agent of {commission_amount} has been calculated for total sales of {total_sale_amount} during the period {reporting_period_start} to {reporting_period_end}.\n\nThank you,\n{business_name}",
                smsBody: "Thank you for your sales at {location_name}. Your Sub-Agent commission of {commission_amount} on total sales of {total_sale_amount} has been calculated. For inquiries call {location_phone}.",
                whatsappText: "Dear {representative_name}, your Sub-Agent commission of {commission_amount} has been calculated. Thanks, {business_name}.",
                cc: '',
                bcc: '',
            },
            companyCommission: {
                emailSubject: "Your Company Commission Statement from {business_name}",
                emailBody: "Dear {representative_name},\n\nYour Company commission of {commission_amount} has been calculated for total sales of {total_sale_amount} during the period {reporting_period_start} to {reporting_period_end}.\n\nThank you,\n{business_name}",
                smsBody: "Thank you for your sales at {location_name}. Your Company commission of {commission_amount} on total sales of {total_sale_amount} has been calculated. For inquiries call {location_phone}.",
                whatsappText: "Dear {representative_name}, your Company commission of {commission_amount} has been calculated. Thanks, {business_name}.",
                cc: '',
                bcc: '',
            },
            autoEmail: false,
            autoSms: false,
            autoWhatsapp: false,
        },
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
