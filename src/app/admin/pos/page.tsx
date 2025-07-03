
'use client';
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  UserPlus,
  X,
  CreditCard,
  PlusCircle,
  Calendar,
  Home,
  Calculator,
  RefreshCw,
  Expand,
  HelpCircle,
  Plus,
  FileText,
  Pause,
  History,
  Info,
  Edit2,
  LayoutGrid,
  WalletCards,
  Monitor,
  Shrink,
  Lock,
  Pencil,
  Printer,
  Grid3x3,
  FileEdit,
  Check,
  Banknote,
  Repeat,
  Wallet,
  Trash2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getProducts } from '@/services/productService';
import { type DetailedProduct, type Sale, type Purchase, type CommissionProfile, type Customer, type Expense, type ExpenseCategory, type Currency, type MoneyExchange } from '@/lib/data';
import { addSale, getSales, deleteSale } from '@/services/saleService';
import { getPurchases } from '@/services/purchaseService';
import { getCommissionProfiles, addCommissionProfile } from '@/services/commissionService';
import { getCustomers, addCustomer } from '@/services/customerService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCurrency } from '@/hooks/use-currency';
import { ThemeToggle } from '@/components/theme-toggle';
import { Skeleton } from '@/components/ui/skeleton';
import { PrintableReceipt } from '@/components/printable-receipt';
import { useSettings, type AllSettings } from '@/hooks/use-settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { addExpense } from '@/services/expenseService';
import { getExpenseCategories } from '@/services/expenseCategoryService';
import { useBusinessSettings } from '@/hooks/use-business-settings';
import { getCurrencies } from '@/services/currencyService';
import { addMoneyExchange } from '@/services/moneyExchangeService';
import { useReactToPrint } from 'react-to-print';

type CartItem = {
  product: DetailedProduct;
  quantity: number;
  sellingPrice: number;
};

const CalculatorDialog = ({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) => {
    const [display, setDisplay] = useState('0');

    const handleButtonClick = (value: string) => {
        if (display === '0' && value !== '.') {
            setDisplay(value);
        } else if (value === 'C') {
            setDisplay('0');
        } else if (value === '=') {
            try {
                // Using eval is generally unsafe, but acceptable for this simple, non-production calculator.
                setDisplay(eval(display.replace(/--/g, '+')).toString());
            } catch {
                setDisplay('Error');
            }
        } else {
            setDisplay(display + value);
        }
    };

    const buttons = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+', 'C'];
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xs">
                <DialogHeader>
                    <DialogTitle>Calculator</DialogTitle>
                </DialogHeader>
                <div className="p-4 bg-muted rounded-md text-right text-3xl font-mono mb-4">{display}</div>
                <div className="grid grid-cols-4 gap-2">
                    {buttons.map(btn => (
                        <Button 
                            key={btn} 
                            onClick={() => handleButtonClick(btn)}
                            variant={btn === '=' || btn === 'C' ? 'destructive' : 'secondary'}
                            className="text-xl h-14"
                        >
                            {btn}
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};

const CloseRegisterDialog = ({
    open,
    onOpenChange,
    cart,
    totalPayable,
    discount,
    user,
    settings,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cart: CartItem[];
    totalPayable: number;
    discount: number;
    user: { name: string; email: string; role: string } | null;
    settings: AllSettings;
}) => {
    const { toast } = useToast();
    const { formatCurrency } = useCurrency();
    const [closingCash, setClosingCash] = useState('');
    const [cardSlips, setCardSlips] = useState('0');
    const [totalCheques, setTotalCheques] = useState('0');
    const [closingNote, setClosingNote] = useState('');

    const [openTime, setOpenTime] = useState('');
    const [closeTime, setCloseTime] = useState('');

    useEffect(() => {
        if (open) {
            const now = new Date();
            const start = new Date(now.getTime() - Math.random() * 8 * 60 * 60 * 1000); // random time in last 8 hours
            setOpenTime(format(start, 'dd MMM, yyyy hh:mm a'));
            setCloseTime(format(now, 'dd MMM, yyyy hh:mm a'));
        }
    }, [open]);

    const openingCash = 1000.00; // Mock data
    const cashPayment = totalPayable; // Simplified for demo
    const totalRefunds = 0.00; // Mock data
    const totalExpenses = 0.00; // Mock data for expenses paid from till
    const creditSales = 0.00; // Mock data
    const totalSales = cashPayment; // Simplified
    const totalPayment = openingCash + totalSales;

    const handleCloseRegister = () => {
        toast({
            title: "Register Closed",
            description: `Register closed successfully.`,
        });
        onOpenChange(false);
    };

    const paymentMethods = [
        { label: 'Cash in hand:', sell: openingCash, expense: null },
        { label: 'Cash Payment:', sell: cashPayment, expense: 0.00 },
        { label: 'Cheque Payment:', sell: 0.00, expense: 0.00 },
        { label: 'Card Payment:', sell: 0.00, expense: 0.00 },
        { label: 'Bank Transfer:', sell: 0.00, expense: 0.00 },
        { label: 'Advance payment:', sell: 0.00, expense: 0.00 },
        { label: 'Custom Payment 1:', sell: 0.00, expense: 0.00 },
        { label: 'Custom Payment 2:', sell: 0.00, expense: 0.00 },
        { label: 'Custom Payment 3:', sell: 0.00, expense: 0.00 },
        { label: 'Other Payments:', sell: 0.00, expense: 0.00 },
    ];
    
    const summaryRows = [
        { label: 'Total Sales:', value: totalSales, color: '' },
        { label: 'Total Refund', value: totalRefunds, color: 'bg-red-100 dark:bg-red-900/20' },
        { label: 'Total Payment', value: totalPayment, color: 'bg-green-100 dark:bg-green-900/20' },
        { label: 'Credit Sales:', value: creditSales, color: '' },
        { label: 'Total Expense:', value: totalExpenses, color: 'bg-red-100 dark:bg-red-900/20' },
    ];

    const totalQuantity = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

    const salesByBrand = useMemo(() => {
        const brands: { [key: string]: { quantity: number; total: number } } = {};
        cart.forEach(item => {
            const brandName = item.product.brand || 'Unbranded';
            if (!brands[brandName]) {
                brands[brandName] = { quantity: 0, total: 0 };
            }
            brands[brandName].quantity += item.quantity;
            brands[brandName].total += item.quantity * item.sellingPrice;
        });
        return Object.entries(brands).map(([name, data]) => ({ name, ...data }));
    }, [cart]);
    
    const totalBrandQuantity = useMemo(() => salesByBrand.reduce((acc, item) => acc + item.quantity, 0), [salesByBrand]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Current Register ( {openTime} - {closeTime} )</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-6">
                    <div className="space-y-6 py-4 text-sm printable-area">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Payment Method</TableHead>
                                    <TableHead className="text-right">Sell</TableHead>
                                    <TableHead className="text-right">Expense</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paymentMethods.map(pm => (
                                    <TableRow key={pm.label}>
                                        <TableCell>{pm.label}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(pm.sell)}</TableCell>
                                        <TableCell className="text-right">{pm.expense !== null ? formatCurrency(pm.expense) : '--'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        
                        <div className="border rounded-md">
                            {summaryRows.map(row => (
                                <div key={row.label} className={cn("flex justify-between p-2 font-semibold border-b last:border-b-0", row.color)}>
                                    <span>{row.label}</span>
                                    <span>{formatCurrency(row.value)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="text-center font-semibold bg-muted p-2 rounded-md">
                            Total = {formatCurrency(openingCash)} (opening) + {formatCurrency(totalSales)} (Sale) - {formatCurrency(totalRefunds)} (Refund) - {formatCurrency(totalExpenses)} (Expense) = {formatCurrency(totalPayment)}
                        </div>

                        <h3 className="font-bold text-base pt-4">Details of products sold</h3>
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow><TableHead>#</TableHead><TableHead>SKU</TableHead><TableHead>Product</TableHead><TableHead className="text-right">Quantity</TableHead><TableHead className="text-right">Total amount</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cart.map((item, index) => (
                                        <TableRow key={item.product.id + index}>
                                            <TableCell>{index + 1}</TableCell><TableCell>{item.product.sku}</TableCell><TableCell>{item.product.name}</TableCell><TableCell className="text-right">{item.quantity}</TableCell><TableCell className="text-right">{formatCurrency(item.quantity * item.sellingPrice)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow className="bg-green-100 dark:bg-green-900/20 font-bold">
                                        <TableCell colSpan={3}>#</TableCell>
                                        <TableCell className="text-right">{totalQuantity}</TableCell>
                                        <TableCell className="text-right">
                                            <p>Discount: (-) {formatCurrency(discount)}</p>
                                            <p>Grand Total: {formatCurrency(totalPayable)}</p>
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>

                        <h3 className="font-bold text-base pt-4">Details of products sold (By Brand)</h3>
                         <div className="border rounded-md">
                            <Table>
                                 <TableHeader>
                                    <TableRow><TableHead>#</TableHead><TableHead>Brands</TableHead><TableHead className="text-right">Quantity</TableHead><TableHead className="text-right">Total amount</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {salesByBrand.map((brand, index) => (
                                        <TableRow key={brand.name}>
                                            <TableCell>{index + 1}</TableCell><TableCell>{brand.name}</TableCell><TableCell className="text-right">{brand.quantity}</TableCell><TableCell className="text-right">{formatCurrency(brand.total)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                 <TableFooter>
                                    <TableRow className="bg-green-100 dark:bg-green-900/20 font-bold">
                                        <TableCell colSpan={2}>#</TableCell>
                                        <TableCell className="text-right">{totalBrandQuantity}</TableCell>
                                        <TableCell className="text-right">
                                            <p>Discount: (-) {formatCurrency(discount)}</p>
                                            <p>Grand Total: {formatCurrency(totalPayable)}</p>
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>
                        
                        <div className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2"><Label htmlFor="total-cash">Total Cash*</Label><Input id="total-cash" type="number" value={closingCash} onChange={(e) => setClosingCash(e.target.value)} placeholder={formatCurrency(cashPayment)} /></div>
                                <div className="space-y-2"><Label htmlFor="total-card-slips">Total Card Slips*</Label><Input id="total-card-slips" type="number" value={cardSlips} onChange={(e) => setCardSlips(e.target.value)} /></div>
                                <div className="space-y-2"><Label htmlFor="total-cheques">Total cheques*</Label><Input id="total-cheques" type="number" value={totalCheques} onChange={(e) => setTotalCheques(e.target.value)} /></div>
                            </div>
                            <div className="mt-4">
                                <h4 className="font-semibold">Cash Denominations</h4>
                                <p className="text-xs text-muted-foreground">Add denominations in Settings -&gt; Business Settings -&gt; POS -&gt; Cash Denominations</p>
                            </div>
                            <div className="mt-4 space-y-2">
                                <Label htmlFor="closing-note">Closing Note:</Label>
                                <Textarea id="closing-note" value={closingNote} onChange={(e) => setClosingNote(e.target.value)} />
                            </div>
                            <div className="mt-6 border-t pt-4">
                                <p><strong>User:</strong> {user?.name}</p>
                                <p><strong>Email:</strong> {user?.email}</p>
                                <p><strong>Business Location:</strong> {settings.business.businessName}</p>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleCloseRegister}>Close Register</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const RegisterDetailsDialog = ({ 
    open, 
    onOpenChange,
    cart,
    totalPayable,
    discount,
    user,
    settings
}: { 
    open: boolean, 
    onOpenChange: (open: boolean) => void,
    cart: CartItem[],
    totalPayable: number,
    discount: number,
    user: { name: string, email: string, role: string } | null,
    settings: AllSettings
}) => {
    const { formatCurrency } = useCurrency();
    const [openTime, setOpenTime] = useState('');

    useEffect(() => {
        if (open) {
            const now = new Date();
            const start = new Date(now.getTime() - Math.random() * 2 * 60 * 60 * 1000); // random time in last 2 hours
            setOpenTime(format(start, 'dd MMM, yyyy hh:mm a'));
        }
    }, [open]);

    const openingCash = 1000.00;
    const cashPayment = totalPayable;
    const totalSales = cashPayment;
    const totalRefund = 0.00;
    const totalExpense = 0.00;
    const totalPayment = openingCash + totalSales;

    const paymentMethods = [
        { label: 'Cash in hand:', sell: openingCash, expense: null },
        { label: 'Cash Payment:', sell: cashPayment, expense: 0.00 },
        { label: 'Cheque Payment:', sell: 0.00, expense: 0.00 },
        { label: 'Card Payment:', sell: 0.00, expense: 0.00 },
        { label: 'Bank Transfer:', sell: 0.00, expense: 0.00 },
        { label: 'Advance payment:', sell: 0.00, expense: 0.00 },
        { label: 'Other Payments:', sell: 0.00, expense: 0.00 },
    ];
    
    const summaryRows = [
        { label: 'Total Sales:', value: totalSales, color: '' },
        { label: 'Total Refund', value: totalRefund, color: 'bg-red-100 dark:bg-red-900/20' },
        { label: 'Total Payment', value: totalPayment, color: 'bg-green-100 dark:bg-green-900/20' },
        { label: 'Total Expense:', value: totalExpense, color: 'bg-red-100 dark:bg-red-900/20' },
    ];

    const totalQuantity = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

    const salesByBrand = useMemo(() => {
        const brands: { [key: string]: { quantity: number; total: number } } = {};
        cart.forEach(item => {
            const brandName = item.product.brand || 'Unbranded';
            if (!brands[brandName]) {
                brands[brandName] = { quantity: 0, total: 0 };
            }
            brands[brandName].quantity += item.quantity;
            brands[brandName].total += item.quantity * item.sellingPrice;
        });
        return Object.entries(brands).map(([name, data]) => ({ name, ...data }));
    }, [cart]);
    
    const totalBrandQuantity = useMemo(() => salesByBrand.reduce((acc, item) => acc + item.quantity, 0), [salesByBrand]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Register Details ({openTime} - Now)</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-6">
                <div className="space-y-4 py-4 text-sm printable-area">
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Payment Method</TableHead>
                                    <TableHead className="text-right">Sell</TableHead>
                                    <TableHead className="text-right">Expense</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paymentMethods.map(pm => (
                                    <TableRow key={pm.label}>
                                        <TableCell>{pm.label}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(pm.sell)}</TableCell>
                                        <TableCell className="text-right">{pm.expense !== null ? formatCurrency(pm.expense) : '--'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="border rounded-md">
                        {summaryRows.map(row => (
                            <div key={row.label} className={cn("flex justify-between p-2 font-semibold border-b last:border-b-0", row.color)}>
                                <span>{row.label}</span>
                                <span>{formatCurrency(row.value)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="text-center font-semibold bg-muted p-2 rounded-md">
                        Total = {formatCurrency(openingCash)} (opening) + {formatCurrency(totalSales)} (Sale) - {formatCurrency(totalRefund)} (Refund) - {formatCurrency(totalExpense)} (Expense) = {formatCurrency(totalPayment)}
                    </div>
                    
                    <h3 className="font-bold text-lg mt-4">Details of products sold</h3>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Total amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cart.map((item, index) => (
                                    <TableRow key={item.product.id + index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.product.sku}</TableCell>
                                        <TableCell>{item.product.name}</TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.quantity * item.sellingPrice)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                             <TableFooter>
                                <TableRow className="bg-green-100 dark:bg-green-900/20 font-bold">
                                    <TableCell colSpan={3}>#</TableCell>
                                    <TableCell className="text-right">{totalQuantity}</TableCell>
                                    <TableCell className="text-right">
                                        <p>Discount: (-) {formatCurrency(discount)}</p>
                                        <p>Grand Total: {formatCurrency(totalPayable)}</p>
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                    
                    <h3 className="font-bold text-lg mt-6">Details of products sold (By Brand)</h3>
                    <div className="border rounded-md">
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Brands</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Total amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {salesByBrand.map((brand, index) => (
                                    <TableRow key={brand.name}>
                                        <TableCell>{index + 1}</TableCell><TableCell>{brand.name}</TableCell><TableCell className="text-right">{brand.quantity}</TableCell><TableCell className="text-right">{formatCurrency(brand.total)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                             <TableFooter>
                                <TableRow className="bg-green-100 dark:bg-green-900/20 font-bold">
                                    <TableCell colSpan={2}>#</TableCell>
                                    <TableCell className="text-right">{totalBrandQuantity}</TableCell>
                                    <TableCell className="text-right">
                                        <p>Discount: (-) {formatCurrency(discount)}</p>
                                        <p>Grand Total: {formatCurrency(totalPayable)}</p>
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                    
                    <div className="mt-6 border-t pt-4">
                        <p><strong>User:</strong> {user?.name}</p>
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Business Location:</strong> {settings.business.businessName}</p>
                    </div>
                </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => window.print()}>Print Mini</Button>
                    <Button variant="default" onClick={() => window.print()}>Print Detailed</Button>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


const RecentTransactionsDialog = ({
    open,
    onOpenChange,
    recentSales,
    onEdit,
    onPrint,
    onDelete,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    recentSales: Sale[];
    onEdit: (saleId: string) => void;
    onPrint: (sale: Sale) => void;
    onDelete: (sale: Sale) => void;
}) => {
    const { formatCurrency } = useCurrency();
    const [activeTab, setActiveTab] = useState("final");

    const handlePrintClick = (sale: Sale) => {
        onOpenChange(false);
        onPrint(sale);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Recent Transactions</DialogTitle>
                </DialogHeader>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList>
                        <TabsTrigger value="final">Final</TabsTrigger>
                        <TabsTrigger value="quotation">Quotation</TabsTrigger>
                        <TabsTrigger value="draft">Draft</TabsTrigger>
                        <TabsTrigger value="suspended">Suspended</TabsTrigger>
                    </TabsList>
                    <TabsContent value="final" className="pt-4">
                        <ScrollArea className="max-h-[60vh]">
                            <Table>
                                <TableBody>
                                    {recentSales.map((sale, index) => (
                                        <TableRow key={sale.id}>
                                            <TableCell className="w-8">{index + 1}.</TableCell>
                                            <TableCell className="font-medium">
                                                {sale.invoiceNo} ({sale.customerName})
                                            </TableCell>
                                            <TableCell className="text-right">{formatCurrency(sale.totalAmount)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => onEdit(sale.id)}>
                                                        <Pencil className="mr-1 h-3 w-3" /> Edit
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="h-8 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700" onClick={() => handlePrintClick(sale)}>
                                                        <Printer className="mr-1 h-3 w-3" /> Print
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => onDelete(sale)}>
                                                        <Trash2 className="mr-1 h-3 w-3" /> Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </TabsContent>
                    <TabsContent value="quotation" className="pt-4">
                        <div className="text-center py-10 text-muted-foreground">Quotations not yet implemented.</div>
                    </TabsContent>
                    <TabsContent value="draft" className="pt-4">
                        <div className="text-center py-10 text-muted-foreground">Drafts not yet implemented.</div>
                    </TabsContent>
                     <TabsContent value="suspended" className="pt-4">
                        <div className="text-center py-10 text-muted-foreground">Suspended sales not yet implemented.</div>
                    </TabsContent>
                </Tabs>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


const EditValueDialog = ({
    open,
    onOpenChange,
    title,
    description,
    value,
    setValue
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    value: number;
    setValue: (value: number) => void;
}) => {
    const [localValue, setLocalValue] = useState(String(value));

    useEffect(() => {
        if (open) {
            setLocalValue(String(value));
        }
    }, [open, value]);

    const handleSave = () => {
        setValue(Number(localValue) || 0);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xs">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="edit-value">Amount</Label>
                    <Input
                        id="edit-value"
                        type="number"
                        value={localValue}
                        onChange={(e) => setLocalValue(e.target.value)}
                        className="mt-2"
                    />
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const CashPaymentDialog = ({
    open,
    onOpenChange,
    totalPayable,
    onSave,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    totalPayable: number;
    onSave: (totalPaid: number) => Promise<boolean>;
}) => {
    const { formatCurrency } = useCurrency();
    const [amountTendered, setAmountTendered] = useState('');
    const [change, setChange] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setAmountTendered('');
            setChange(0);
            setIsSaving(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open]);

    useEffect(() => {
        const tendered = parseFloat(amountTendered) || 0;
        if (tendered >= totalPayable) {
            setChange(tendered - totalPayable);
        } else {
            setChange(0);
        }
    }, [amountTendered, totalPayable]);

    const handleSaveClick = async () => {
        setIsSaving(true);
        const success = await onSave(parseFloat(amountTendered) || totalPayable);
        setIsSaving(false);
        if (success) {
            onOpenChange(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveClick();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cash Payment</DialogTitle>
                    <DialogDescription>
                        Enter the amount received from the customer.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total Payable</p>
                        <p className="text-4xl font-bold">{formatCurrency(totalPayable)}</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="amount-tendered">Amount Tendered</Label>
                        <Input
                            ref={inputRef}
                            id="amount-tendered"
                            type="number"
                            placeholder="0.00"
                            value={amountTendered}
                            onChange={(e) => setAmountTendered(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="text-center text-2xl h-14"
                            disabled={isSaving}
                        />
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Change Due</p>
                        <p className="text-3xl font-bold text-green-600">{formatCurrency(change)}</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSaveClick} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Finalize Payment"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const CardPaymentDialog = ({
    open,
    onOpenChange,
    totalPayable,
    onSave,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    totalPayable: number;
    onSave: () => Promise<boolean>;
}) => {
    const { formatCurrency } = useCurrency();
    const [cardDetails, setCardDetails] = useState({ number: '', holder: '', month: '', year: '', cvv: '' });
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            setIsSaving(false);
            setCardDetails({ number: '', holder: '', month: '', year: '', cvv: '' });
        }
    }, [open]);

    const handleSaveClick = async () => {
        if (!cardDetails.number || !cardDetails.holder || !cardDetails.month || !cardDetails.year || !cardDetails.cvv) {
            toast({ title: 'Missing Card Details', description: 'Please fill in all card details to proceed.', variant: 'destructive' });
            return;
        }
        setIsSaving(true);
        const success = await onSave();
        setIsSaving(false);
        if (success) {
            onOpenChange(false);
        }
    };
    

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Card Payment</DialogTitle>
                    <DialogDescription>
                        Enter card details for a total of <strong>{formatCurrency(totalPayable)}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input id="card-number" placeholder="XXXX XXXX XXXX XXXX" value={cardDetails.number} onChange={(e) => setCardDetails(d => ({...d, number: e.target.value}))} disabled={isSaving}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="card-holder">Card Holder Name</Label>
                        <Input id="card-holder" placeholder="John Doe" value={cardDetails.holder} onChange={(e) => setCardDetails(d => ({...d, holder: e.target.value}))} disabled={isSaving}/>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                            <Label htmlFor="expiry-month">Expiry Month</Label>
                            <Input id="expiry-month" placeholder="MM" value={cardDetails.month} onChange={(e) => setCardDetails(d => ({...d, month: e.target.value}))} disabled={isSaving}/>
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="expiry-year">Expiry Year</Label>
                            <Input id="expiry-year" placeholder="YYYY" value={cardDetails.year} onChange={(e) => setCardDetails(d => ({...d, year: e.target.value}))} disabled={isSaving}/>
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input id="cvv" placeholder="123" value={cardDetails.cvv} onChange={(e) => setCardDetails(d => ({...d, cvv: e.target.value}))} disabled={isSaving}/>
                            </div>
                    </div>
                </div>
                <DialogFooter>
                     <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSaveClick} disabled={isSaving}>{isSaving ? "Saving..." : "Finalize Payment"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const CommissionSelector = ({
  entityType,
  label,
  profiles,
  selectedProfile,
  onSelect,
  onRemove,
}: {
  entityType?: CommissionProfile['entityType'] | 'All';
  label: string;
  profiles: CommissionProfile[];
  selectedProfile: CommissionProfile | null;
  onSelect: (profile: CommissionProfile) => void;
  onRemove: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredProfiles = useMemo(() => {
    if (!searchTerm) return [];
    const lowercasedTerm = searchTerm.toLowerCase();
    return profiles.filter(
      (p) =>
        (entityType === 'All' || !entityType || p.entityType === entityType) &&
        (p.name.toLowerCase().includes(lowercasedTerm) ||
          p.phone.includes(searchTerm))
    ).slice(0, 5);
  }, [searchTerm, profiles, entityType]);

  if (selectedProfile) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-10 px-3 py-2 text-sm border rounded-md bg-muted flex items-center">
            {selectedProfile.name}
            <Badge variant="secondary" className="ml-2">{selectedProfile.entityType}</Badge>
          </div>
          <Button variant="ghost" size="icon" className="text-red-500" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`${entityType || 'all'}-search`}>{label}</Label>
      <div className="relative">
        <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          id={`${entityType || 'all'}-search`}
          placeholder={`Search ${label}...`}
          className="pl-10 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete="off"
        />
        {filteredProfiles.length > 0 && (
          <div className="absolute z-20 w-full bg-card border rounded-md shadow-lg mt-1 top-full">
            {filteredProfiles.map((profile) => (
              <div
                key={profile.id}
                className="p-2 hover:bg-accent cursor-pointer text-sm"
                onClick={() => {
                  onSelect(profile);
                  setSearchTerm('');
                }}
              >
                <div>{profile.name} <Badge variant="secondary">{profile.entityType}</Badge></div>
                <div className="text-xs text-muted-foreground">{profile.phone}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AddCommissionProfileDialog = ({ open, onOpenChange, profileType, onProfileAdded }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    profileType: 'Agent' | 'Sub-Agent' | 'Company' | 'Salesperson' | '';
    onProfileAdded: () => void;
}) => {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        if (open) {
            setName('');
            setPhone('');
        }
    }, [open]);

    const handleSave = async () => {
        if (!name || !phone || !profileType) {
            toast({ title: 'Validation Error', description: 'Name and Phone are required.', variant: 'destructive' });
            return;
        }

        const newProfile: Omit<CommissionProfile, 'id'> = {
            name,
            entityType: profileType,
            phone,
            commission: { overall: 0 } // Default commission
        };

        try {
            await addCommissionProfile(newProfile);
            toast({ title: 'Success', description: `${profileType} has been added.` });
            onProfileAdded();
            onOpenChange(false);
        } catch (error) {
            console.error(`Failed to add ${profileType}:`, error);
            toast({ title: 'Error', description: `Failed to add ${profileType}.`, variant: 'destructive' });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New {profileType}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="profile-name">Name *</Label>
                        <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={`${profileType} Name`} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="profile-phone">Phone Number *</Label>
                        <Input id="profile-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const AddExpenseDialog = ({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) => {
    const { toast } = useToast();
    const settings = useBusinessSettings();
    const { formatCurrency } = useCurrency();
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        expenseCategory: '',
        referenceNo: '',
        totalAmount: '',
        expenseNote: '',
    });

    useEffect(() => {
        if (open) {
            const fetchCategories = async () => {
                setIsLoading(true);
                try {
                    const cats = await getExpenseCategories();
                    setCategories(cats.filter(c => !c.parentId));
                } catch (error) {
                    toast({ title: "Error", description: "Could not load expense categories.", variant: "destructive" });
                } finally {
                    setIsLoading(false);
                }
            };
            fetchCategories();
            // Reset form
            setFormData({
                expenseCategory: '',
                referenceNo: '',
                totalAmount: '',
                expenseNote: '',
            });
        }
    }, [open, toast]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value}));
    };
    
    const handleSelectChange = (value: string) => {
        setFormData(prev => ({...prev, expenseCategory: value}));
    };

    const handleSaveExpense = async () => {
        const categorySelection = categories.find(c => c.id === formData.expenseCategory);
        if (!formData.totalAmount || !categorySelection) {
            toast({ title: "Validation Error", description: "Category and Total Amount are required.", variant: "destructive" });
            return;
        }

        try {
            const total = parseFloat(formData.totalAmount);
            const expenseData: Omit<Expense, 'id'> = {
                date: new Date().toISOString(),
                referenceNo: formData.referenceNo || `EXP-POS-${Date.now()}`,
                location: settings.business.businessName,
                expenseCategory: categorySelection.name,
                subCategory: null,
                paymentStatus: 'Paid',
                tax: 0,
                totalAmount: total,
                paymentDue: 0, // Assuming paid from till
                expenseFor: null,
                contact: null,
                addedBy: 'Admin', // Hardcoded from POS
                expenseNote: formData.expenseNote,
            };

            await addExpense(expenseData);
            toast({ title: "Expense Added", description: `Expense of ${formatCurrency(total)} has been recorded.` });
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to add expense from POS:", error);
            toast({ title: "Error", description: "Failed to save expense.", variant: "destructive" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Quick Expense</DialogTitle>
                    <DialogDescription>Record an expense paid from the register.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="expenseCategory">Expense Category *</Label>
                        <Select value={formData.expenseCategory} onValueChange={handleSelectChange} disabled={isLoading}>
                            <SelectTrigger id="expenseCategory">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {isLoading ? (
                                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                                ) : (
                                    categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="totalAmount">Total Amount *</Label>
                        <Input id="totalAmount" type="number" placeholder="0.00" value={formData.totalAmount} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="referenceNo">Reference No.</Label>
                        <Input id="referenceNo" placeholder="Optional" value={formData.referenceNo} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="expenseNote">Expense Note</Label>
                        <Textarea id="expenseNote" placeholder="Add a note for this expense" value={formData.expenseNote} onChange={handleInputChange}/>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSaveExpense}>Save Expense</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const MoneyExchangeDialog = ({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) => {
    const { toast } = useToast();
    const { user } = useAuth();
    const { settings } = useSettings();
    const { formatCurrency } = useCurrency();
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [amount, setAmount] = useState('');
    const [fromCurrency, setFromCurrency] = useState<string | undefined>(undefined);
    const [toCurrency, setToCurrency] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (open) {
            const fetchCurrencies = async () => {
                setIsLoading(true);
                try {
                    const currencyData = await getCurrencies();
                    setCurrencies(currencyData);
                    // Set default currencies if available
                    const base = currencyData.find(c => c.isBaseCurrency);
                    const firstOther = currencyData.find(c => !c.isBaseCurrency);
                    if (base) setFromCurrency(base.code);
                    if (firstOther) setToCurrency(firstOther.code);
                } catch (e) {
                    toast({ title: 'Error', description: 'Could not load currencies.', variant: 'destructive'});
                } finally {
                    setIsLoading(false);
                }
            }
            fetchCurrencies();
            setAmount('');
        }
    }, [open, toast]);

    const { baseRate, offeredRate, convertedAmount, profit } = useMemo(() => {
        if (!fromCurrency || !toCurrency || !amount || currencies.length === 0) {
            return { baseRate: 0, offeredRate: 0, convertedAmount: 0, profit: 0 };
        }
        
        const from = currencies.find(c => c.code === fromCurrency);
        const to = currencies.find(c => c.code === toCurrency);
        const markupPercent = parseFloat(settings.exchange.rateMarkupPercent) || 0;

        if (!from || !to) return { baseRate: 0, offeredRate: 0, convertedAmount: 0, profit: 0 };

        const rate = (1 / from.exchangeRate) * to.exchangeRate;
        const markup = rate * (markupPercent / 100);
        const finalRate = rate - markup; // Customer gets fewer units of 'to' currency for their 'from' currency
        
        const finalAmount = parseFloat(amount) * finalRate;
        const profitAmount = parseFloat(amount) * markup;

        return { baseRate: rate, offeredRate: finalRate, convertedAmount: finalAmount, profit: profitAmount };

    }, [amount, fromCurrency, toCurrency, currencies, settings.exchange.rateMarkupPercent]);
    
    const handleConfirmExchange = async () => {
        if (!fromCurrency || !toCurrency || !amount || convertedAmount <= 0) {
            toast({ title: 'Invalid Exchange', description: 'Please fill all fields and enter a valid amount.', variant: 'destructive'});
            return;
        }

        try {
            await addMoneyExchange({
                date: new Date().toISOString(),
                fromCurrency,
                toCurrency,
                amount: parseFloat(amount),
                baseRate: baseRate,
                offeredRate: offeredRate,
                markupPercent: parseFloat(settings.exchange.rateMarkupPercent),
                profit: profit,
                convertedAmount: convertedAmount,
                addedBy: user?.name || 'Unknown',
            });
            toast({ title: 'Success', description: `Exchanged ${amount} ${fromCurrency} to ${convertedAmount.toFixed(2)} ${toCurrency}.`});
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save money exchange:", error);
            toast({ title: 'Error', description: 'Could not record the exchange.', variant: 'destructive'});
        }
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Money Exchange</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="exchange-amount">Amount</Label>
                        <Input id="exchange-amount" type="number" placeholder="Enter amount to exchange" value={amount} onChange={(e) => setAmount(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="space-y-2 flex-1">
                            <Label htmlFor="from-currency">From</Label>
                            <Select value={fromCurrency} onValueChange={setFromCurrency} disabled={isLoading}>
                                <SelectTrigger id="from-currency"><SelectValue placeholder="From..."/></SelectTrigger>
                                <SelectContent>
                                    {currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.code} ({c.name})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <Repeat className="w-5 h-5 mt-6 shrink-0 text-muted-foreground"/>
                        <div className="space-y-2 flex-1">
                            <Label htmlFor="to-currency">To</Label>
                            <Select value={toCurrency} onValueChange={setToCurrency} disabled={isLoading}>
                                <SelectTrigger id="to-currency"><SelectValue placeholder="To..."/></SelectTrigger>
                                <SelectContent>
                                    {currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.code} ({c.name})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Card className="p-4 space-y-3">
                        <div className="text-xs text-muted-foreground flex justify-between">
                            <span>Base Rate: 1 {fromCurrency} = {baseRate.toFixed(4)} {toCurrency}</span>
                            <span>Markup: {settings.exchange.rateMarkupPercent}%</span>
                        </div>
                        <div className="text-sm font-semibold flex justify-between">
                           <span>Your Rate: 1 {fromCurrency} = {offeredRate.toFixed(4)} {toCurrency}</span>
                           <span className="text-green-600">Profit: {profit.toFixed(2)} {fromCurrency}</span>
                        </div>
                        <Separator/>
                         <div className="text-center">
                            <p className="text-sm text-muted-foreground">Customer Receives</p>
                            <p className="text-2xl font-bold mt-1">{convertedAmount.toFixed(2)} {toCurrency}</p>
                        </div>
                    </Card>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleConfirmExchange} disabled={isLoading}>Confirm Exchange</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function PosPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [time, setTime] = useState('');
  const [activeFilter, setActiveFilter] = useState<'category' | 'brands'>('category');
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const { settings } = useSettings();
  const { user } = useAuth();

  const [products, setProducts] = useState<DetailedProduct[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedCustomer, setSelectedCustomer] = useState('walk-in');

  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', mobile: '', email: '' });
  
  const [isAddProfileOpen, setIsAddProfileOpen] = useState(false);
  const [profileTypeToAdd, setProfileTypeToAdd] = useState<'Agent' | 'Sub-Agent' | 'Company' | 'Salesperson' | ''>('');

  const [priceGroup, setPriceGroup] = useState('default');

  const [isMultiPayOpen, setIsMultiPayOpen] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [changeDue, setChangeDue] = useState(0);
  
  const [isCardPaymentOpen, setIsCardPaymentOpen] = useState(false);
  
  const [discount, setDiscount] = useState(0);
  const [orderTax, setOrderTax] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);

  // States for new header functions
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCloseRegisterOpen, setIsCloseRegisterOpen] = useState(false);
  const [isRegisterDetailsOpen, setIsRegisterDetailsOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isRecentTransactionsOpen, setIsRecentTransactionsOpen] = useState(false);
  const [isCashPaymentOpen, setIsCashPaymentOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSuspendedSalesOpen, setIsSuspendedSalesOpen] = useState(false);
  const [isExchangeOpen, setIsExchangeOpen] = useState(false);

  // States for agent selection
  const [commissionProfiles, setCommissionProfiles] = useState<CommissionProfile[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<CommissionProfile | null>(null);
  const [selectedSubAgent, setSelectedSubAgent] = useState<CommissionProfile | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CommissionProfile | null>(null);
  const [selectedSalesperson, setSelectedSalesperson] = useState<CommissionProfile | null>(null);

  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const [isDeleteSaleDialogOpen, setIsDeleteSaleDialogOpen] = useState(false);
  
  // Ref for printing
  const [saleToPrint, setSaleToPrint] = useState<Sale | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
      content: () => receiptRef.current,
      onAfterPrint: () => setSaleToPrint(null),
  });

  useEffect(() => {
    if (saleToPrint) {
        handlePrint();
    }
  }, [saleToPrint, handlePrint]);
  
  const fetchAndCalculateStock = useCallback(async () => {
      if (products.length === 0) {
        setIsLoading(true);
      }
        
      try {
        const [productsData, salesData, purchasesData, profilesData, customersData] = await Promise.all([
          getProducts(),
          getSales(),
          getPurchases(),
          getCommissionProfiles(),
          getCustomers(),
        ]);

        setCustomers(customersData);
        setRecentSales(salesData.slice(0, 10));

        const salesByProduct = salesData.flatMap(s => s.items).reduce((acc, item) => {
          acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
          return acc;
        }, {} as Record<string, number>);

        const purchasesByProduct = purchasesData.flatMap(p => p.items).reduce((acc, item) => {
          acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
          return acc;
        }, {} as Record<string, number>);

        const productsWithCalculatedStock = productsData.map(product => {
          const purchased = purchasesByProduct[product.id] || 0;
          const sold = salesByProduct[product.id] || 0;
          const calculatedStock = (product.currentStock || 0) + purchased - sold;
          return { ...product, currentStock: calculatedStock };
        });

        setProducts(productsWithCalculatedStock);
        setCommissionProfiles(profilesData);
      } catch (error) {
        console.error("Failed to fetch data and calculate stock:", error);
        toast({
          title: "Error",
          description: "Could not load stock levels. Please try refreshing.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }, [toast, products.length]);

  useEffect(() => {
    fetchAndCalculateStock();
  }, [fetchAndCalculateStock]);

  useEffect(() => {
    const updateCurrentTime = () => {
      setTime(new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(',', ''));
    };
    updateCurrentTime();
    const timer = setInterval(updateCurrentTime, 1000 * 60);
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    const onFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.sellingPrice * item.quantity, 0);
  }, [cart]);

  const totalPayable = useMemo(() => subtotal - discount + orderTax + shipping, [subtotal, discount, orderTax, shipping]);
  
  useEffect(() => {
    const customerDisplayData = {
        cart: cart.map(item => ({
            product: { name: item.product.name },
            quantity: item.quantity,
            sellingPrice: item.sellingPrice
        })),
        subtotal,
        discount,
        orderTax,
        shipping,
        totalPayable,
    };
    localStorage.setItem('pos-customer-display-data', JSON.stringify(customerDisplayData));
}, [cart, subtotal, discount, orderTax, shipping, totalPayable]);


  useEffect(() => {
    if (isMultiPayOpen) {
      const cash = parseFloat(cashAmount) || 0;
      const card = parseFloat(cardAmount) || 0;
      const totalPaid = cash + card;
      if (totalPaid >= totalPayable) {
        setChangeDue(totalPaid - totalPayable);
      } else {
        setChangeDue(0);
      }
    }
  }, [cashAmount, cardAmount, totalPayable, isMultiPayOpen]);


  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, products]);

  const searchResults = useMemo(() => {
      if (!searchTerm) return [];
      return products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5);
  }, [searchTerm, products]);

  const addToCart = (product: DetailedProduct) => {
    const price = priceGroup === 'wholesale' ? product.sellingPrice * 0.9 : product.sellingPrice;

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.product.id === product.id
      );
      if (existingItem) {
        return currentCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentCart, { product, quantity: 1, sellingPrice: price }];
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart((currentCart) =>
        currentCart.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const removeFromCart = (productId: string) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.product.id !== productId)
    );
  };

  const clearCart = (showToast = true) => {
    setCart([]);
    setDiscount(0);
    setOrderTax(0);
    setShipping(0);
    setSelectedAgent(null);
    setSelectedSubAgent(null);
    setSelectedCompany(null);
    setSelectedSalesperson(null);
    localStorage.removeItem('pos-customer-display-data');
    if (showToast) {
        toast({
            title: 'Cart Cleared',
            description: 'The transaction has been cancelled.',
        });
    }
  };

  const createSaleObject = (paymentMethod: string, paymentStatus: 'Paid' | 'Due' | 'Partial' | 'Suspended', totalPaid: number): Omit<Sale, 'id'> => {
      const commissionAgentIds = [
          selectedAgent?.id,
          selectedSubAgent?.id,
          selectedCompany?.id,
          selectedSalesperson?.id
      ].filter((id): id is string => !!id);
      
      const customer = customers.find(c => c.id === selectedCustomer);
      const customerId = customer ? customer.id : null;
      const customerName = customer ? customer.name : 'Walk-In Customer';
      const contactNumber = customer ? customer.mobile : 'N/A';

      return {
          date: new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', ''),
          invoiceNo: `INV-${Date.now()}`,
          customerId,
          customerName,
          contactNumber,
          location: settings.business.businessName,
          paymentStatus: paymentStatus,
          paymentMethod: paymentMethod,
          totalAmount: totalPayable,
          totalPaid: totalPaid,
          sellDue: Math.max(0, totalPayable - totalPaid),
          sellReturnDue: 0,
          shippingStatus: null,
          totalItems: cart.reduce((sum, item) => sum + item.quantity, 0),
          addedBy: 'Admin', // Mocked
          sellNote: null,
          staffNote: null,
          shippingDetails: null,
          items: cart.map(item => ({
              productId: item.product.id,
              quantity: item.quantity,
              unitPrice: item.sellingPrice,
              tax: 0, // Simplified
          })),
          taxAmount: orderTax,
          commissionAgentIds: commissionAgentIds.length > 0 ? commissionAgentIds : null,
      };
  };

  const finalizeSale = async (sale: Omit<Sale, 'id'>): Promise<Sale | null> => {
      if (cart.length === 0) {
        toast({ title: 'Cart Empty', description: 'Please add products to the cart first.', variant: 'destructive' });
        return null;
      }
      
      if (
        settings.sale.enableCommissionAgent &&
        !selectedAgent && !selectedSubAgent && !selectedCompany && !selectedSalesperson
      ) {
          toast({
              title: "Agent Required",
              description: "A commission agent must be selected for this sale as per business settings.",
              variant: "destructive",
          });
          return null;
      }
      
      if (settings.pos.isServiceStaffRequired && !selectedSalesperson) {
          toast({
              title: "Service Staff Required",
              description: "Please select a service staff member (Salesperson) for this sale.",
              variant: "destructive",
          });
          return null;
      }

      try {
          const savedSaleId = await addSale(sale, settings.sale.commissionCalculationType, settings.sale.commissionCategoryRule);
          toast({
              title: 'Sale Finalized',
              description: `Payment of ${formatCurrency(sale.totalPaid)} recorded.`,
          });
          
          const completeSaleForReceipt: Sale = {
            id: savedSaleId,
            ...sale,
          };
          
          clearCart(false);
          await fetchAndCalculateStock();
          return completeSaleForReceipt;
      } catch (error) {
          console.error("Failed to save sale:", error);
          toast({
              title: "Error",
              description: "Could not save the sale. Please try again.",
              variant: "destructive"
          });
          return null;
      }
  };

  const handleFinalizeCashPayment = async (totalPaid: number): Promise<boolean> => {
    const paymentStatus = totalPaid >= totalPayable ? 'Paid' : (totalPaid > 0 ? 'Partial' : 'Due');
    const newSale = createSaleObject('Cash', paymentStatus, totalPaid);
    const savedSale = await finalizeSale(newSale);
    if(savedSale) {
        setSaleToPrint(savedSale);
        return true;
    }
    return false;
  };
  
  const handleFinalizeCardPayment = async (): Promise<boolean> => {
    const newSale = createSaleObject('Card', 'Paid', totalPayable);
    const savedSale = await finalizeSale(newSale);
    if(savedSale) {
        setSaleToPrint(savedSale);
        return true;
    }
    return false;
  };

  const handleFinalizeMultiPay = async () => {
      const cash = parseFloat(cashAmount) || 0;
      const card = parseFloat(cardAmount) || 0;
      const totalPaid = cash + card;

      if (totalPaid < totalPayable) {
          toast({ title: 'Insufficient Payment', description: `Paid amount is less than the total payable of ${formatCurrency(totalPayable)}.`, variant: 'destructive'});
          return;
      }

      const newSale = createSaleObject('Multiple', 'Paid', totalPaid);
      const savedSale = await finalizeSale(newSale);
      if (savedSale) {
          setSaleToPrint(savedSale);
      }
      setCashAmount('');
      setCardAmount('');
      setIsMultiPayOpen(false);
  };

  const handleDraft = () => {
      if (cart.length === 0) {
        toast({ title: 'Cart Empty', description: 'Please add products to the cart first.', variant: 'destructive' });
        return;
      }
      toast({ title: 'Draft Saved', description: 'The current sale has been saved as a draft.' });
      clearCart();
    };
  
    const handleQuotation = () => {
      if (cart.length === 0) {
        toast({ title: 'Cart Empty', description: 'Please add products to the cart first.', variant: 'destructive' });
        return;
      }
      toast({ title: 'Quotation Saved', description: 'The current sale has been saved as a quotation.' });
      clearCart();
    };
    
    const handleSuspend = async () => {
      if (cart.length === 0) {
        toast({ title: 'Cart Empty', description: 'Please add products to the cart first.', variant: 'destructive' });
        return;
      }
      
      const newSale = createSaleObject('Suspended', 'Due', 0);
      const savedSale = await finalizeSale(newSale);

      if(savedSale){
        toast({ title: 'Sale Suspended', description: 'The current sale has been suspended.' });
        if (settings.pos.printInvoiceOnSuspend) {
            setSaleToPrint(savedSale);
        }
      }
    };
    
    const handleCreditSale = async () => {
      if (cart.length === 0) {
        toast({ title: 'Cart Empty', description: 'Please add products to the cart first.', variant: 'destructive' });
        return;
      }
      const newSale = createSaleObject('Credit', 'Due', 0);
      const savedSale = await finalizeSale(newSale);
      if (savedSale) {
        setSaleToPrint(savedSale);
      }
    };
  
    const handleToggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const handleRefresh = () => window.location.reload();
    const handleCustomerDisplay = () => window.open('/customer-display', '_blank', 'noopener,noreferrer');

    const handleSaveCustomer = async () => {
        if (!newCustomer.name || !newCustomer.mobile) {
            toast({
                title: "Validation Error",
                description: "Name and Mobile Number are required.",
                variant: "destructive"
            });
            return;
        }

        try {
            const customerToAdd: Omit<Customer, 'id'> = {
                contactId: '',
                name: newCustomer.name,
                email: newCustomer.email || null,
                taxNumber: '',
                customerGroup: 'retail',
                openingBalance: 0,
                addedOn: new Date().toLocaleDateString('en-CA'),
                address: '',
                mobile: newCustomer.mobile,
                totalSaleDue: 0,
                totalSaleReturnDue: 0,
            };
            await addCustomer(customerToAdd);
            toast({
                title: "Success",
                description: "Customer has been added successfully."
            });
            
            // Re-fetch customers to update the list
            const updatedCustomers = await getCustomers();
            setCustomers(updatedCustomers);

            setIsAddCustomerOpen(false);
            setNewCustomer({ name: '', mobile: '', email: '' });
        } catch (error) {
            console.error("Failed to add customer:", error);
            toast({
                title: "Error",
                description: "Failed to add customer. Please try again.",
                variant: "destructive"
            });
        }
    };
    
    const handleOpenAddProfileDialog = (type: 'Agent' | 'Sub-Agent' | 'Company' | 'Salesperson') => {
        setProfileTypeToAdd(type);
        setIsAddProfileOpen(true);
    };

    const handleEditSale = (saleId: string) => {
        router.push(`/admin/sales/edit/${saleId}`);
    };
    
    const handleDeleteSaleClick = (sale: Sale) => {
        setSaleToDelete(sale);
        setIsDeleteSaleDialogOpen(true);
    };
    
    const confirmDeleteSale = async () => {
        if (!saleToDelete) return;
        try {
            await deleteSale(saleToDelete.id);
            toast({ title: 'Success', description: 'Sale deleted successfully' });
            await fetchAndCalculateStock(); // Refetch to update recent sales
        } catch (error) {
            console.error('Failed to delete sale:', error);
            toast({ title: 'Error', description: 'Failed to delete sale', variant: 'destructive' });
        } finally {
            setIsDeleteSaleDialogOpen(false);
            setSaleToDelete(null);
        }
    };
    
    const handlePrintFromDialog = (sale: Sale) => {
        setSaleToPrint(sale);
    };

  return (
    <div className="pos-page-container">
      <div className="relative">
          <TooltipProvider>
              <div className="flex flex-col h-screen bg-background text-foreground font-sans">
                  <header className="bg-card shadow-sm p-2 flex items-center justify-between z-10 flex-wrap gap-y-2">
                      <div className="flex items-center gap-2">
                          <h2 className="text-sm font-semibold hidden md:block">Location: <span className="font-bold">{settings.business.businessName}</span></h2>
                          {settings.pos.enableTransactionDate && (
                              <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>{time}</span>
                              </div>
                          )}
                      </div>
                      <div className="flex items-center gap-1">
                          <Link href="/admin/dashboard">
                              <Button variant="ghost" size="icon" className="text-muted-foreground" title="Go to Dashboard">
                                  <Home />
                              </Button>
                          </Link>
                           <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => setIsExchangeOpen(true)} title="Money Exchange"><Repeat /></Button>
                          <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => setIsRegisterDetailsOpen(true)} title="Register Details"><Grid3x3 /></Button>
                          <Button variant="ghost" size="icon" className="text-red-500" title="Close Register" onClick={() => setIsCloseRegisterOpen(true)}><Lock /></Button>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:flex" onClick={() => setIsCalculatorOpen(true)}><Calculator /></Button>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:flex" onClick={handleRefresh}><RefreshCw /></Button>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:flex" onClick={handleToggleFullscreen}>{isFullscreen ? <Shrink/> : <Expand />}</Button>
                          <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={handleCustomerDisplay}><Monitor /></Button>
                          <ThemeToggle className="text-muted-foreground" />
                          <Button variant="ghost" size="icon" className="text-muted-foreground"><HelpCircle /></Button>
                          <Button variant="destructive" className="h-9 px-3" onClick={() => setIsAddExpenseOpen(true)}>
                              <PlusCircle className="h-4 w-4 sm:mr-2"/> <span className="hidden sm:inline">Add Expense</span>
                          </Button>
                      </div>
                  </header>

                  {/* Main Content */}
                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden">
                      
                      {/* Left Side: Cart */}
                      <div className="lg:col-span-5 flex flex-col gap-2">
                          <Card className="p-3 bg-card">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex items-center gap-2">
                                      <UserPlus className="text-muted-foreground flex-shrink-0"/>
                                      <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                                      <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Select a customer" />
                                      </SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="walk-in">Walk-In Customer</SelectItem>
                                          {customers.map(customer => (
                                              <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                                          ))}
                                      </SelectContent>
                                      </Select>
                                      <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
                                          <DialogTrigger asChild>
                                              <Button size="icon" className="flex-shrink-0"><Plus/></Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                              <DialogHeader>
                                                  <DialogTitle>Add New Customer</DialogTitle>
                                                  <DialogDescription>Quickly add a new customer to the system.</DialogDescription>
                                              </DialogHeader>
                                              <div className="space-y-4 py-4">
                                                  <div className="space-y-2">
                                                      <Label htmlFor="name">Name *</Label>
                                                      <Input id="name" value={newCustomer.name} onChange={(e) => setNewCustomer(p => ({...p, name: e.target.value}))} placeholder="Customer Name" />
                                                  </div>
                                                  <div className="space-y-2">
                                                      <Label htmlFor="mobile">Mobile *</Label>
                                                      <Input id="mobile" value={newCustomer.mobile} onChange={(e) => setNewCustomer(p => ({...p, mobile: e.target.value}))} placeholder="Mobile Number" />
                                                  </div>
                                                  <div className="space-y-2">
                                                      <Label htmlFor="email">Email</Label>
                                                      <Input id="email" type="email" value={newCustomer.email} onChange={(e) => setNewCustomer(p => ({...p, email: e.target.value}))} placeholder="Email Address" />
                                                  </div>
                                              </div>
                                              <DialogFooter>
                                                  <Button variant="secondary" onClick={() => setIsAddCustomerOpen(false)}>Cancel</Button>
                                                  <Button onClick={handleSaveCustomer}>Save Customer</Button>
                                              </DialogFooter>
                                          </DialogContent>
                                      </Dialog>
                                  </div>
                                  <div className="space-y-2">
                                      <Label>Selling Price Group</Label>
                                      <Select value={priceGroup} onValueChange={setPriceGroup}>
                                          <SelectTrigger className="h-10">
                                              <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                              <SelectItem value="default">Default Selling Price</SelectItem>
                                              <SelectItem value="wholesale">Wholesale</SelectItem>
                                          </SelectContent>
                                      </Select>
                                  </div>
                                  {settings.pos.showInvoiceScheme && (
                                      <div className="space-y-2">
                                      <Label>Invoice Scheme</Label>
                                      <Select><SelectTrigger className="h-10"><SelectValue placeholder="Default" /></SelectTrigger></Select>
                                      </div>
                                  )}
                                  {settings.pos.showInvoiceLayoutDropdown && (
                                      <div className="space-y-2">
                                      <Label>Invoice Layout</Label>
                                      <Select><SelectTrigger className="h-10"><SelectValue placeholder="Default" /></SelectTrigger></Select>
                                      </div>
                                  )}
                              </div>

                              {settings.sale.enableCommissionAgent || settings.modules.serviceStaff ? (
                                  <>
                                      <Separator className="my-4" />
                                      {settings.modules.advancedCommission ? (
                                          <div className="space-y-4">
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                  <div className="flex items-center gap-2">
                                                      <div className="flex-1">
                                                          <CommissionSelector entityType="Agent" label="Agent" profiles={commissionProfiles} selectedProfile={selectedAgent} onSelect={setSelectedAgent} onRemove={() => setSelectedAgent(null)} />
                                                      </div>
                                                      <Button size="icon" className="flex-shrink-0 self-end mb-1" onClick={() => handleOpenAddProfileDialog('Agent')}><Plus/></Button>
                                                  </div>
                                              </div>
                                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                  <div className="flex items-center gap-2">
                                                      <div className="flex-1">
                                                          <CommissionSelector entityType="Salesperson" label="Salesperson" profiles={commissionProfiles} selectedProfile={selectedSalesperson} onSelect={setSelectedSalesperson} onRemove={() => setSelectedSalesperson(null)} />
                                                      </div>
                                                      <Button size="icon" className="flex-shrink-0 self-end mb-1" onClick={() => handleOpenAddProfileDialog('Salesperson')}><Plus/></Button>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                      <div className="flex-1">
                                                          <CommissionSelector entityType="Sub-Agent" label="Sub" profiles={commissionProfiles} selectedProfile={selectedSubAgent} onSelect={setSelectedSubAgent} onRemove={() => setSelectedSubAgent(null)} />
                                                      </div>
                                                      <Button size="icon" className="flex-shrink-0 self-end mb-1" onClick={() => handleOpenAddProfileDialog('Sub-Agent')}><Plus/></Button>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                      <div className="flex-1">
                                                          <CommissionSelector entityType="Company" label="Com" profiles={commissionProfiles} selectedProfile={selectedCompany} onSelect={setSelectedCompany} onRemove={() => setSelectedCompany(null)} />
                                                      </div>
                                                      <Button size="icon" className="flex-shrink-0 self-end mb-1" onClick={() => handleOpenAddProfileDialog('Company')}><Plus/></Button>
                                                  </div>
                                              </div>
                                          </div>
                                      ) : settings.sale.enableCommissionAgent ? (
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <CommissionSelector
                                                    label="Commission Agent"
                                                    entityType="All"
                                                    profiles={commissionProfiles}
                                                    selectedProfile={selectedSalesperson}
                                                    onSelect={setSelectedSalesperson}
                                                    onRemove={() => setSelectedSalesperson(null)}
                                                />
                                            </div>
                                            <Button size="icon" className="flex-shrink-0 self-end mb-1" onClick={() => handleOpenAddProfileDialog('Salesperson')}><Plus/></Button>
                                        </div>
                                      ) : settings.modules.serviceStaff ? (
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <CommissionSelector 
                                                    entityType="Salesperson"
                                                    label="Service Staff"
                                                    profiles={commissionProfiles}
                                                    selectedProfile={selectedSalesperson}
                                                    onSelect={setSelectedSalesperson}
                                                    onRemove={() => setSelectedSalesperson(null)}
                                                />
                                            </div>
                                            <Button size="icon" className="flex-shrink-0 self-end mb-1" onClick={() => handleOpenAddProfileDialog('Salesperson')}><Plus/></Button>
                                        </div>
                                      ) : null}
                                  </>
                              ): null}
                              
                              <Separator className="my-4" />
                              <div className="relative flex items-center">
                                  <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
                                  <Input
                                      placeholder="Product name/SKU"
                                      className="pl-10 w-full"
                                      value={searchTerm}
                                      onChange={(e) => setSearchTerm(e.target.value)}
                                  />
                                  <Button size="icon" className="ml-2 flex-shrink-0"><Plus/></Button>
                              </div>
                              {!settings.pos.dontShowProductSuggestion && searchTerm && searchResults.length > 0 && (
                                  <div className="relative">
                                  <div className="absolute z-20 w-full bg-card border rounded-md shadow-lg -mt-1 top-full">
                                      {searchResults.map((product) => (
                                      <div
                                          key={product.id}
                                          className="p-2 hover:bg-accent cursor-pointer text-sm"
                                          onClick={() => {
                                              addToCart(product);
                                              setSearchTerm('');
                                          }}
                                      >
                                          {product.name} ({product.sku})
                                      </div>
                                      ))}
                                  </div>
                                  </div>
                              )}
                          </Card>

                          <Card className="flex-1 flex flex-col bg-card">
                              <div className="p-4 flex-grow flex flex-col">
                              <div className="grid grid-cols-12 gap-2 font-bold border-b pb-2 text-sm text-muted-foreground">
                                  <div className={cn("col-span-4 flex items-center", settings.pos.enableServiceStaffInProductLine && "col-span-3")}>Product <Info className="w-3 h-3 ml-1"/></div>
                                  {settings.pos.enableServiceStaffInProductLine && <div className="col-span-2">Staff</div>}
                                  <div className={cn("col-span-2", settings.pos.enableServiceStaffInProductLine && "col-span-1")}>Quantity</div>
                                  <div className="col-span-2">Price inc. tax</div>
                                  <div className="col-span-2">Subtotal</div>
                                  <div className="col-span-1 text-center"><X className="w-4 h-4 mx-auto"/></div>
                              </div>
                              <ScrollArea className="flex-grow h-0">
                                  <div className="py-2">
                                  {cart.length > 0 ? (
                                      cart.map((item) => (
                                      <div key={item.product.id} className="grid grid-cols-12 gap-2 items-center text-sm mb-2">
                                              <div className={cn("col-span-4 font-medium truncate", settings.pos.enableServiceStaffInProductLine && "col-span-3")}>{item.product.name}</div>
                                              {settings.pos.enableServiceStaffInProductLine && (
                                                  <div className="col-span-2">
                                                      <Select>
                                                          <SelectTrigger className="h-8 text-xs">
                                                          <SelectValue placeholder="Select Staff" />
                                                          </SelectTrigger>
                                                          <SelectContent>
                                                          <SelectItem value="admin">Mr Admin</SelectItem>
                                                          <SelectItem value="cashier">Mr Cashier</SelectItem>
                                                          </SelectContent>
                                                      </Select>
                                                  </div>
                                              )}
                                              <div className={cn("col-span-2", settings.pos.enableServiceStaffInProductLine && "col-span-1")}>
                                                  <Input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 0)} className="h-8 w-16 text-center" />
                                              </div>
                                              <div className="col-span-2">{formatCurrency(item.sellingPrice)}</div>
                                              <div className="col-span-2 font-semibold">{formatCurrency(item.sellingPrice * item.quantity)}</div>
                                              <div className="col-span-1 text-center">
                                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeFromCart(item.product.id)}><X className="w-4 h-4"/></Button>
                                              </div>
                                      </div>
                                      ))
                                  ) : (
                                      <div className="text-center py-20 text-muted-foreground">Cart is empty</div>
                                  )}
                                  </div>
                              </ScrollArea>
                              </div>
                              <div className="border-t p-3 mt-auto text-sm space-y-2 bg-muted">
                                  <div className="flex justify-between">
                                      <span>Items: <span className="font-semibold">{cart.length} ({cart.reduce((a, b) => a + b.quantity, 0)})</span></span> 
                                      <span>Total: <span className="font-semibold">{formatCurrency(subtotal)}</span></span>
                                  </div>
                                  <div className="flex justify-between items-center text-muted-foreground">
                                      <span className="flex items-center gap-1">Discount (-): 
                                          {settings.pos.showPricingTooltip && <Tooltip><TooltipTrigger asChild><Info className="w-3 h-3 inline cursor-help"/></TooltipTrigger><TooltipContent>Edit discount</TooltipContent></Tooltip>}
                                          {!settings.pos.disableDiscount && <Edit2 className="w-3 h-3 inline cursor-pointer hover:text-foreground" onClick={() => setIsDiscountModalOpen(true)}/>}
                                      </span> 
                                      <span className="text-foreground">{formatCurrency(discount)}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-muted-foreground">
                                      <span className="flex items-center gap-1">Order Tax (+):
                                          {settings.pos.showPricingTooltip && <Tooltip><TooltipTrigger asChild><Info className="w-3 h-3 inline cursor-help"/></TooltipTrigger><TooltipContent>Edit order tax</TooltipContent></Tooltip>}
                                          {!settings.pos.disableDiscount && <Edit2 className="w-3 h-3 inline cursor-pointer hover:text-foreground" onClick={() => setIsTaxModalOpen(true)}/>}
                                      </span> 
                                      <span className="text-foreground">{formatCurrency(orderTax)}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-muted-foreground">
                                      <span className="flex items-center gap-1">Shipping (+):
                                          {settings.pos.showPricingTooltip && <Tooltip><TooltipTrigger asChild><Info className="w-3 h-3 inline cursor-help"/></TooltipTrigger><TooltipContent>Edit shipping charges</TooltipContent></Tooltip>}
                                          {!settings.pos.disableDiscount && <Edit2 className="w-3 h-3 inline cursor-pointer hover:text-foreground" onClick={() => setIsShippingModalOpen(true)}/>}
                                      </span>
                                      <span className="text-foreground">{formatCurrency(shipping)}</span>
                                  </div>
                              </div>
                          </Card>
                      </div>
                      
                      {/* Right Side: Product Selection */}
                      <div className="lg:col-span-7 flex flex-col gap-2">
                          <div className="grid grid-cols-2 gap-2">
                              <Button onClick={() => setActiveFilter('category')} variant={activeFilter === 'category' ? 'default' : 'secondary'} className="text-lg py-6"><LayoutGrid className="mr-2"/> Category</Button>
                              <Button onClick={() => setActiveFilter('brands')} variant={activeFilter === 'brands' ? 'default' : 'secondary'} className="text-lg py-6"><Repeat className="mr-2"/> Brands</Button>
                          </div>
                          <Card className="flex-1 flex flex-col bg-card p-2">
                              <ScrollArea className="h-full">
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
                                      {isLoading ? (
                                          Array.from({ length: 10 }).map((_, i) => (
                                              <Card key={i}>
                                                  <div className="relative aspect-square bg-muted">
                                                      <Skeleton className="h-full w-full" />
                                                  </div>
                                                  <div className="p-2 text-center">
                                                      <Skeleton className="h-4 w-3/4 mx-auto mb-1" />
                                                      <Skeleton className="h-3 w-1/2 mx-auto mb-1" />
                                                      <Skeleton className="h-4 w-1/4 mx-auto mb-1" />
                                                      <Skeleton className="h-3 w-1/3 mx-auto" />
                                                  </div>
                                              </Card>
                                          ))
                                      ) : (
                                      filteredProducts.map(product => (
                                          <Card key={product.id} className="cursor-pointer group overflow-hidden bg-card" onClick={() => addToCart(product)}>
                                              <div className="relative aspect-square bg-muted">
                                                  <Image
                                                      src={product.image}
                                                      alt={product.name}
                                                      fill
                                                      className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                                                      data-ai-hint={product.name.split(' ').slice(0, 2).join(' ')}
                                                  />
                                              </div>
                                              <div className="p-2 text-center">
                                                  <p className="text-xs font-semibold truncate">{product.name}</p>
                                                  <p className="text-xs text-muted-foreground">({product.sku})</p>
                                                  <p className="text-sm font-bold text-primary">{formatCurrency(product.sellingPrice)}</p>
                                                  <p className="text-xs text-green-600 dark:text-green-400 font-bold">{product.currentStock ?? 0} {product.unit} in stock</p>
                                              </div>
                                          </Card>
                                      ))
                                      )}
                                  </div>
                              </ScrollArea>
                          </Card>
                      </div>
                  </div>
                  
                  <footer className="bg-card shadow-[0_-2px_5px_-1px_rgba(0,0,0,0.1)] p-2 z-10">
                      <div className="flex items-center justify-between gap-2">
                           <div className="flex items-center gap-1">
                              {!settings.pos.disableDraft && <Button variant="ghost" className="h-auto p-1 flex-col text-xs hover:bg-transparent text-foreground" onClick={handleDraft}><FileEdit className="h-5 w-5 mb-1 text-blue-500" /><span>Draft</span></Button>}
                              <Button variant="ghost" className="h-auto p-1 flex-col text-xs hover:bg-transparent text-foreground" onClick={handleQuotation}><FileText className="h-5 w-5 mb-1 text-yellow-500" /><span>Quotation</span></Button>
                              {!settings.pos.disableSuspendSale && <Button variant="ghost" className="h-auto p-1 flex-col text-xs hover:bg-transparent text-foreground" onClick={handleSuspend}><Pause className="h-5 w-5 mb-1 text-red-500" /><span>Suspend</span></Button>}
                              {!settings.pos.disableCreditSaleButton && <Button variant="ghost" className="h-auto p-1 flex-col text-xs hover:bg-transparent text-foreground" onClick={handleCreditSale}><Check className="h-5 w-5 mb-1 text-purple-500" /><span>Credit Sale</span></Button>}
                           </div>

                           <div className="flex-1 flex justify-center items-center gap-2">
                                <Button className="bg-pink-600 hover:bg-pink-700 text-white h-12 text-base px-6" onClick={() => setIsCardPaymentOpen(true)}>
                                    <CreditCard className="h-5 w-5 mr-2"/>Card
                                </Button>
                                <Dialog open={isMultiPayOpen} onOpenChange={setIsMultiPayOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-blue-600 hover:bg-blue-700 h-12 text-base px-6"><WalletCards className="h-5 w-5 mr-2"/>Multiple Pay</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Finalize Payment</DialogTitle>
                                            <DialogDescription>
                                                Split the payment across multiple methods. Total payable is <strong>{formatCurrency(totalPayable)}</strong>.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="cash-amount" className="text-right">Cash</Label>
                                                <Input id="cash-amount" type="number" placeholder="0.00" className="col-span-3" value={cashAmount} onChange={(e) => setCashAmount(e.target.value)} />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="card-amount" className="text-right">Card</Label>
                                                <Input id="card-amount" type="number" placeholder="0.00" className="col-span-3" value={cardAmount} onChange={(e) => setCardAmount(e.target.value)} />
                                            </div>
                                            <div className="text-right font-medium">Remaining: {formatCurrency(Math.max(0, totalPayable - (parseFloat(cashAmount) || 0) - (parseFloat(cardAmount) || 0)))}</div>
                                            <div className="text-right font-medium">Change Due: <span className="font-bold text-green-600">{formatCurrency(changeDue)}</span></div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" onClick={handleFinalizeMultiPay}>Finalize Payment</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                {!settings.pos.disableExpressCheckout && <Button className="bg-green-500 hover:bg-green-600 text-white h-12 text-base px-6" onClick={() => setIsCashPaymentOpen(true)}><Banknote className="h-5 w-5 mr-2"/>Cash</Button>}
                                <Button variant="destructive" className="h-12 text-base px-6" onClick={() => clearCart()}><X className="h-5 w-5 mr-2"/>Cancel</Button>
                           </div>
                           
                           <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <span className="text-sm text-muted-foreground">Total Payable:</span>
                                    <h3 className="text-2xl font-bold text-green-600">{formatCurrency(totalPayable)}</h3>
                                </div>
                                <Button variant="default" className="h-12 text-base" onClick={() => setIsRecentTransactionsOpen(true)}>
                                  <History className="mr-2 h-5 w-5" />
                                  Recent Transactions
                                </Button>
                           </div>
                      </div>
                  </footer>
              </div>
          </TooltipProvider>
      </div>
      
      <div className="hidden">
          <PrintableReceipt ref={receiptRef} sale={saleToPrint} products={products} />
      </div>

      {/* Dialogs that are part of the main page state */}
      <CalculatorDialog open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen} />
      <CloseRegisterDialog
          open={isCloseRegisterOpen}
          onOpenChange={setIsCloseRegisterOpen}
          cart={cart}
          totalPayable={totalPayable}
          discount={discount}
          user={user}
          settings={settings}
      />
      <RecentTransactionsDialog
          open={isRecentTransactionsOpen}
          onOpenChange={setIsRecentTransactionsOpen}
          recentSales={recentSales}
          onEdit={handleEditSale}
          onPrint={handlePrintFromDialog}
          onDelete={handleDeleteSaleClick}
      />
      <RegisterDetailsDialog
          open={isRegisterDetailsOpen}
          onOpenChange={setIsRegisterDetailsOpen}
          cart={cart}
          totalPayable={totalPayable}
          discount={discount}
          user={user}
          settings={settings}
      />
      <EditValueDialog
          open={isDiscountModalOpen}
          onOpenChange={setIsDiscountModalOpen}
          title="Edit Discount"
          description="Enter the total discount amount for this order."
          value={discount}
          setValue={setDiscount}
      />
      <EditValueDialog
          open={isTaxModalOpen}
          onOpenChange={setIsTaxModalOpen}
          title="Edit Order Tax"
          description="Enter the total tax amount for this order."
          value={orderTax}
          setValue={setOrderTax}
      />
      <EditValueDialog
          open={isShippingModalOpen}
          onOpenChange={setIsShippingModalOpen}
          title="Edit Shipping Charges"
          description="Enter the shipping charges for this order."
          value={shipping}
          setValue={setShipping}
      />
      <CashPaymentDialog
          open={isCashPaymentOpen}
          onOpenChange={setIsCashPaymentOpen}
          totalPayable={totalPayable}
          onSave={handleFinalizeCashPayment}
      />
       <CardPaymentDialog
          open={isCardPaymentOpen}
          onOpenChange={setIsCardPaymentOpen}
          totalPayable={totalPayable}
          onSave={handleFinalizeCardPayment}
      />
      <AddCommissionProfileDialog
          open={isAddProfileOpen}
          onOpenChange={setIsAddProfileOpen}
          profileType={profileTypeToAdd}
          onProfileAdded={fetchAndCalculateStock}
      />
      <AlertDialog open={isDeleteSaleDialogOpen} onOpenChange={setIsDeleteSaleDialogOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to delete this sale?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This will permanently delete the sale with invoice number "{saleToDelete?.invoiceNo}". This action cannot be undone.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsDeleteSaleDialogOpen(false)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDeleteSale} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
      <AddExpenseDialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen} />
       <Dialog open={isSuspendedSalesOpen} onOpenChange={setIsSuspendedSalesOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Suspended Sales</DialogTitle>
                  <DialogDescription>Select a suspended sale to resume.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                  <p className="text-center text-muted-foreground">No suspended sales found.</p>
              </div>
              <DialogFooter>
                  <Button variant="secondary" onClick={() => setIsSuspendedSalesOpen(false)}>Close</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      <MoneyExchangeDialog open={isExchangeOpen} onOpenChange={setIsExchangeOpen} />
    </div>
  );
}
