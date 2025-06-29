
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
  Minus,
  Calendar,
  Home,
  Save,
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
  Copyright,
  Undo2,
  WalletCards,
  Monitor,
  Shrink,
  Lock,
  Pencil,
  Printer,
  Trash2,
  Grid3x3,
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
import { type DetailedProduct, type Sale, type Purchase, type CommissionProfile, type Customer } from '@/lib/data';
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
import { AppFooter } from '@/components/app-footer';
import { useAuth } from '@/hooks/use-auth';

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

const CloseRegisterDialog = ({ open, onOpenChange, totalPayable }: { open: boolean, onOpenChange: (open: boolean) => void, totalPayable: number }) => {
    const { toast } = useToast();
    const { formatCurrency } = useCurrency();
    const [closingCash, setClosingCash] = useState('');
    const openingCash = 100.00; // Mock data
    const totalCashSales = totalPayable; // Simplified for demo
    const totalRefunds = 0; // Mock data
    const totalExpenses = 0; // Mock data for expenses paid from till

    const expected = openingCash + totalCashSales - totalRefunds - totalExpenses;
    const difference = parseFloat(closingCash) - expected || 0;

    const handleCloseRegister = () => {
        toast({
            title: "Register Closed",
            description: `Register closed with a difference of ${formatCurrency(difference)}.`,
        });
        onOpenChange(false);
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Close Register</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex justify-between"><span>Opening Cash:</span><span>{formatCurrency(openingCash)}</span></div>
                    <div className="flex justify-between"><span>Total Cash Sales:</span><span>{formatCurrency(totalCashSales)}</span></div>
                    <div className="flex justify-between"><span>Total Cash Refunds:</span><span>- {formatCurrency(totalRefunds)}</span></div>
                    <div className="flex justify-between"><span>Total Cash Expenses:</span><span>- {formatCurrency(totalExpenses)}</span></div>
                    <Separator/>
                    <div className="flex justify-between font-bold"><span>Expected In Register:</span><span>{formatCurrency(expected)}</span></div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="closing-cash" className="text-right">Closing Cash</Label>
                        <Input id="closing-cash" type="number" className="col-span-3" value={closingCash} onChange={(e) => setClosingCash(e.target.value)} />
                    </div>
                     <div className="flex justify-between font-bold text-red-500"><span>Difference:</span><span>{formatCurrency(difference)}</span></div>
                     <Textarea placeholder="Closing note..." />
                </div>
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
    const openingCash = 1000.00; // Mock data
    const totalSale = totalPayable + discount;
    const totalInRegister = openingCash + totalSale;
    
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

        return Object.entries(brands).map(([name, data]) => ({
            name,
            ...data,
        }));
    }, [cart]);
    
    const totalBrandQuantity = useMemo(() => salesByBrand.reduce((acc, item) => acc + item.quantity, 0), [salesByBrand]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Register Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 text-sm printable-area">
                    <div className="text-center font-semibold bg-muted p-2 rounded-md">
                        Total = {formatCurrency(openingCash)} (opening) + {formatCurrency(totalSale)} (Sale) - {formatCurrency(0)} (Refund) - {formatCurrency(0)} (Expense) = {formatCurrency(totalInRegister)}
                    </div>
                    
                    <h3 className="font-bold text-lg mt-4">Details of products sold</h3>
                    <div className="border rounded-md max-h-[250px] overflow-y-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background z-10">
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
                                    <TableRow key={item.product.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.product.sku}</TableCell>
                                        <TableCell>{item.product.name}</TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.quantity * item.sellingPrice)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                     <div className="bg-green-100 dark:bg-green-900/20 font-bold p-2 rounded-md flex justify-between text-sm">
                        <span>#</span>
                        <div className="flex gap-4">
                            <span>{totalQuantity}</span>
                            <div className="text-right">
                                <p>Discount: (-) {formatCurrency(discount)}</p>
                                <p>Grand Total: {formatCurrency(totalPayable)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <h3 className="font-bold text-lg mt-6">Details of products sold (By Brand)</h3>
                    <div className="border rounded-md max-h-[250px] overflow-y-auto">
                        <Table>
                             <TableHeader className="sticky top-0 bg-background z-10">
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
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{brand.name}</TableCell>
                                        <TableCell className="text-right">{brand.quantity}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(brand.total)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/20 font-bold p-2 rounded-md flex justify-between text-sm">
                        <span>#</span>
                        <div className="flex gap-4">
                            <span>{totalBrandQuantity}</span>
                            <div className="text-right">
                                <p>Discount: (-) {formatCurrency(discount)}</p>
                                <p>Grand Total: {formatCurrency(totalPayable)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 border-t pt-4">
                        <p><strong>User:</strong> {user?.name}</p>
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Business Location:</strong> {settings.business.businessName}</p>
                    </div>
                </div>
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
        onOpenChange(false); // Close this dialog first
        onPrint(sale); // Then trigger print after a short delay
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
    onPrintAndClose,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    totalPayable: number;
    onSave: (totalPaid: number) => Promise<boolean>;
    onPrintAndClose: () => void;
}) => {
    const { formatCurrency } = useCurrency();
    const [amountTendered, setAmountTendered] = useState('');
    const [change, setChange] = useState(0);
    const [isFinalized, setIsFinalized] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setAmountTendered('');
            setChange(0);
            setIsFinalized(false);
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
        const success = await onSave(parseFloat(amountTendered) || 0);
        setIsSaving(false);
        if (success) {
            setIsFinalized(true);
        }
    };

    const handlePrintClick = () => {
        onPrintAndClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (isFinalized) {
                handlePrintClick();
            } else {
                handleSaveClick();
            }
        }
    };

    const buttonAction = isFinalized ? handlePrintClick : handleSaveClick;
    const buttonText = isFinalized ? "Print Receipt" : (isSaving ? "Saving..." : "Finalize Payment");

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
                            disabled={isFinalized || isSaving}
                        />
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Change Due</p>
                        <p className="text-3xl font-bold text-green-600">{formatCurrency(change)}</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={buttonAction} disabled={isSaving}>
                        {buttonText}
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
    onPrintAndClose,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    totalPayable: number;
    onSave: () => Promise<boolean>;
    onPrintAndClose: () => void;
}) => {
    const { formatCurrency } = useCurrency();
    const [cardDetails, setCardDetails] = useState({ number: '', holder: '', month: '', year: '', cvv: '' });
    const [isFinalized, setIsFinalized] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            setIsFinalized(false);
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
            setIsFinalized(true);
        }
    };
    
    const handlePrintClick = () => {
        onPrintAndClose();
    };
    
    const buttonAction = isFinalized ? handlePrintClick : handleSaveClick;
    const buttonText = isFinalized ? "Print Receipt" : (isSaving ? "Saving..." : "Finalize Payment");

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
                        <Input id="card-number" placeholder="XXXX XXXX XXXX XXXX" value={cardDetails.number} onChange={(e) => setCardDetails(d => ({...d, number: e.target.value}))} disabled={isFinalized}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="card-holder">Card Holder Name</Label>
                        <Input id="card-holder" placeholder="John Doe" value={cardDetails.holder} onChange={(e) => setCardDetails(d => ({...d, holder: e.target.value}))} disabled={isFinalized}/>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                            <Label htmlFor="expiry-month">Expiry Month</Label>
                            <Input id="expiry-month" placeholder="MM" value={cardDetails.month} onChange={(e) => setCardDetails(d => ({...d, month: e.target.value}))} disabled={isFinalized}/>
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="expiry-year">Expiry Year</Label>
                            <Input id="expiry-year" placeholder="YYYY" value={cardDetails.year} onChange={(e) => setCardDetails(d => ({...d, year: e.target.value}))} disabled={isFinalized}/>
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input id="cvv" placeholder="123" value={cardDetails.cvv} onChange={(e) => setCardDetails(d => ({...d, cvv: e.target.value}))} disabled={isFinalized}/>
                            </div>
                    </div>
                </div>
                <DialogFooter>
                     <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={buttonAction} disabled={isSaving}>{buttonText}</Button>
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
  entityType: CommissionProfile['entityType'];
  label: string;
  profiles: CommissionProfile[];
  selectedProfile: CommissionProfile | null;
  onSelect: (profile: CommissionProfile) => void;
  onRemove: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredProfiles = useMemo(() => {
    if (!searchTerm) return [];
    return profiles.filter(
      (p) =>
        p.entityType === entityType &&
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      <Label htmlFor={`${entityType}-search`}>{label}</Label>
      <div className="relative">
        <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          id={`${entityType}-search`}
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

  // States for agent selection
  const [commissionProfiles, setCommissionProfiles] = useState<CommissionProfile[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<CommissionProfile | null>(null);
  const [selectedSubAgent, setSelectedSubAgent] = useState<CommissionProfile | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CommissionProfile | null>(null);
  const [selectedSalesperson, setSelectedSalesperson] = useState<CommissionProfile | null>(null);

  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const [isDeleteSaleDialogOpen, setIsDeleteSaleDialogOpen] = useState(false);
  
  // Ref for printing
  const receiptRef = useRef<HTMLDivElement>(null);
  const [saleToPrint, setSaleToPrint] = useState<Sale | null>(null);
  const [finalizedSaleForPrinting, setFinalizedSaleForPrinting] = useState<Sale | null>(null);

  // Effect for browser-based printing
  useEffect(() => {
    if (saleToPrint) {
        // A small timeout ensures the class is applied and the DOM updates
        // before the blocking print dialog appears.
        const timer = setTimeout(() => {
            document.body.classList.add('is-printing');
            window.print();
            document.body.classList.remove('is-printing');
            setSaleToPrint(null); // Reset after printing
        }, 100); 

        return () => clearTimeout(timer);
    }
  }, [saleToPrint]);
  
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

      return {
          date: new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', ''),
          invoiceNo: `INV-${Date.now()}`,
          customerName: 'Walk-In Customer', // Simplified
          contactNumber: 'N/A', // Simplified
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
        settings.sale.isCommissionAgentPhoneCompulsory &&
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
          setIsMultiPayOpen(false);
          setIsCardPaymentOpen(false);
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

  const handleCashPayment = () => {
    if (cart.length === 0) {
        toast({ title: 'Cart Empty', description: 'Please add products to the cart first.', variant: 'destructive' });
        return;
    }
    setIsCashPaymentOpen(true);
  };
  
  const handleSaveFromCashDialog = async (totalPaid: number): Promise<boolean> => {
    const paymentStatus = totalPaid >= totalPayable ? 'Paid' : (totalPaid > 0 ? 'Partial' : 'Due');
    const newSale = createSaleObject('Cash', paymentStatus, totalPaid);
    const savedSale = await finalizeSale(newSale);
    if(savedSale) {
        setFinalizedSaleForPrinting(savedSale);
        return true;
    }
    return false;
  };
  
  const handleSaveFromCardDialog = async (): Promise<boolean> => {
    const newSale = createSaleObject('Card', 'Paid', totalPayable);
    const savedSale = await finalizeSale(newSale);
    if(savedSale) {
        setFinalizedSaleForPrinting(savedSale);
        return true;
    }
    return false;
  };

  const handlePrintAndCloseDialog = () => {
    if (finalizedSaleForPrinting) {
        setSaleToPrint(finalizedSaleForPrinting);
        setFinalizedSaleForPrinting(null);
        setIsCashPaymentOpen(false);
        setIsCardPaymentOpen(false);
    }
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
      const newSale = createSaleObject('Credit', 'Due', 0);
      const savedSale = await finalizeSale(newSale);
      if (savedSale) {
        setSaleToPrint(savedSale);
      }
    };
  
    const handleCardPayment = () => {
      if (cart.length === 0) {
        toast({ title: 'Cart Empty', description: 'Please add products to the cart first.', variant: 'destructive' });
        return;
      }
      setIsCardPaymentOpen(true);
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
    <>
        <div className="pos-page-container">
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
                                <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:flex" title="Go to Dashboard">
                                    <Home />
                                </Button>
                            </Link>
                            <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => setIsRegisterDetailsOpen(true)} title="Register Details"><Grid3x3 /></Button>
                            <Button variant="ghost" size="icon" className="text-red-500 hidden sm:flex" title="Close Register" onClick={() => setIsCloseRegisterOpen(true)}><Lock /></Button>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:flex" onClick={() => setIsCalculatorOpen(true)}><Calculator /></Button>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:flex" onClick={handleRefresh}><RefreshCw /></Button>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:flex" onClick={handleToggleFullscreen}>{isFullscreen ? <Shrink/> : <Expand />}</Button>
                            <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={handleCustomerDisplay}><Monitor /></Button>
                            <ThemeToggle className="text-muted-foreground" />
                            <Button variant="ghost" size="icon" className="text-muted-foreground"><HelpCircle /></Button>
                            <Link href="/admin/expenses/add" passHref>
                                <Button variant="destructive" className="h-9 px-3">
                                    <PlusCircle className="h-4 w-4 sm:mr-2"/> <span className="hidden sm:inline">Add Expense</span>
                                </Button>
                            </Link>
                        </div>
                    </header>

                    {/* Main Content */}
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-8 gap-4 p-4 overflow-hidden">
                        
                        {/* Left Side: Cart */}
                        <div className="lg:col-span-3 flex flex-col gap-2">
                            <Card className="p-3 bg-card">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <UserPlus className="text-muted-foreground flex-shrink-0"/>
                                        <Select defaultValue="walk-in">
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
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1">
                                                    <CommissionSelector entityType="Salesperson" label={settings.sale.enableCommissionAgent ? "Commission Agent" : "Service Staff"} profiles={commissionProfiles} selectedProfile={selectedSalesperson} onSelect={setSelectedSalesperson} onRemove={() => setSelectedSalesperson(null)} />
                                                </div>
                                                <Button size="icon" className="flex-shrink-0 self-end mb-1" onClick={() => handleOpenAddProfileDialog('Salesperson')}><Plus/></Button>
                                            </div>
                                        )}
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
                        <div className="lg:col-span-5 flex flex-col gap-2">
                        <div className="grid grid-cols-2 gap-2">
                            <Button onClick={() => setActiveFilter('category')} variant={activeFilter === 'category' ? 'default' : 'secondary'} className="text-lg py-6"><LayoutGrid className="mr-2"/> Category</Button>
                            <Button onClick={() => setActiveFilter('brands')} variant={activeFilter === 'brands' ? 'default' : 'secondary'} className="text-lg py-6"><Copyright className="mr-2"/> Brands</Button>
                        </div>
                        <Card className="flex-1 bg-card p-2">
                            <ScrollArea className="h-full">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2">
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
                    
                    <footer className="bg-card shadow-[0_-2px_5px_-1px_rgba(0,0,0,0.1)] p-2 flex flex-col md:flex-row md:items-center md:justify-between z-10 gap-2">
                        <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-center md:justify-start">
                            {!settings.pos.disableDraft && <Button variant="outline" className="h-9 px-2 sm:px-4" onClick={handleDraft}><FileText className="h-4 w-4 sm:mr-2"/><span className="hidden sm:inline">Draft</span></Button>}
                            <Button variant="outline" className="h-9 px-2 sm:px-4" onClick={handleQuotation}><FileText className="h-4 w-4 sm:mr-2"/><span className="hidden sm:inline">Quotation</span></Button>
                            {!settings.pos.disableSuspendSale && <Button variant="outline" className="text-red-500 border-red-500/50 hover:bg-destructive/10 hover:text-red-500 h-9 px-2 sm:px-4" onClick={handleSuspend}><Pause className="h-4 w-4 sm:mr-2"/><span className="hidden sm:inline">Suspend</span></Button>}
                            {!settings.pos.disableCreditSaleButton && <Button variant="outline" className="h-9 px-2 sm:px-4" onClick={handleCreditSale}><Undo2 className="h-4 w-4 sm:mr-2"/><span className="hidden sm:inline">Credit Sale</span></Button>}
                            <Button variant="outline" className="h-9 px-2 sm:px-4" onClick={handleCardPayment}><CreditCard className="h-4 w-4 sm:mr-2"/><span className="hidden sm:inline">Card</span></Button>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-center">
                            {!settings.pos.disableMultiplePay && (
                                <Dialog open={isMultiPayOpen} onOpenChange={setIsMultiPayOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-blue-600 hover:bg-blue-700 h-9 px-2 sm:px-4"><WalletCards className="h-4 w-4 sm:mr-2"/> <span className="hidden sm:inline">Multiple Pay</span></Button>
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
                            )}
                            
                            {!settings.pos.disableExpressCheckout && <Button className="bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm" onClick={handleCashPayment}>Cash</Button>}
                            <Button variant="destructive" className="text-xs sm:text-sm" onClick={() => clearCart()}>Cancel</Button>
                        </div>
                        <div className="text-center md:text-right w-full md:w-auto">
                            <span className="text-xs sm:text-sm text-muted-foreground">Total Payable:</span>
                            <h3 className="text-lg sm:text-2xl font-bold text-green-600">{formatCurrency(totalPayable)}</h3>
                        </div>
                    </footer>
                </div>
            </TooltipProvider>
        </div>
        
        <div className="printable-receipt-area-wrapper" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
            <PrintableReceipt ref={receiptRef} sale={saleToPrint} products={products} />
        </div>

        {/* Dialogs that are part of the main page state */}
        <CalculatorDialog open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen} />
        <CloseRegisterDialog open={isCloseRegisterOpen} onOpenChange={setIsCloseRegisterOpen} totalPayable={totalPayable} />
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
            onSave={handleSaveFromCashDialog}
            onPrintAndClose={handlePrintAndCloseDialog}
        />
         <CardPaymentDialog
            open={isCardPaymentOpen}
            onOpenChange={setIsCardPaymentOpen}
            totalPayable={totalPayable}
            onSave={handleSaveFromCardDialog}
            onPrintAndClose={handlePrintAndCloseDialog}
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
                    <DialogTitle>Are you sure you want to delete this sale?</DialogTitle>
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
        <div className="absolute bottom-4 right-4 print-hidden">
            <Button variant="default" size="sm" className="h-9" onClick={() => setIsRecentTransactionsOpen(true)}>
                <History className="mr-2 h-4 w-4" />
                Recent Transactions
            </Button>
        </div>
        <AppFooter />
    </>
  );
}
