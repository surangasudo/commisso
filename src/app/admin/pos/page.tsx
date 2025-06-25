
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  Search,
  UserPlus,
  X,
  CreditCard,
  PlusCircle,
  Minus,
  Calendar,
  Rewind,
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
  Briefcase,
  Shrink,
  Lock,
} from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { products, type Product, sales as recentSalesData } from '@/lib/data';
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
import { Label } from "@/components/ui/label";
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCurrency } from '@/hooks/use-currency';


const productHints: { [key: string]: string } = {
  'prod-001': 'laptop computer',
  'prod-002': 'laptop computer',
  'prod-003': 'fuji apple',
  'prod-004': 'white smartphone',
  'prod-005': 'gray smartphone',
  'prod-006': 'silver laptop',
  'prod-007': 'banana bunch',
  'prod-008': 'pasta box',
  'prod-009': 'butter cookies',
  'prod-010': 'crew socks',
  'prod-011': 'book cover',
  'prod-012': 'book cover',
};

type CartItem = {
  product: Product;
  quantity: number;
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
    const expected = openingCash + totalCashSales;
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


const RecentTransactionsDialog = ({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) => {
    const { toast } = useToast();
    const { formatCurrency } = useCurrency();
    const handleReturn = (saleId: string) => {
        toast({
            title: "Return Initiated",
            description: `Sell return process started for sale ${saleId}. This is a demo.`,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Recent Transactions</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice No.</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentSalesData.map(sale => (
                            <TableRow key={sale.id}>
                                <TableCell>{sale.invoiceNo}</TableCell>
                                <TableCell>{sale.customerName}</TableCell>
                                <TableCell>{formatCurrency(sale.totalAmount)}</TableCell>
                                <TableCell>
                                    <Button size="sm" variant="outline" onClick={() => handleReturn(sale.invoiceNo)}>Return</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
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


export default function PosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [time, setTime] = useState('');
  const [activeFilter, setActiveFilter] = useState<'category' | 'brands'>('category');
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  const [isMultiPayOpen, setIsMultiPayOpen] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [changeDue, setChangeDue] = useState(0);
  
  const [isCardPaymentOpen, setIsCardPaymentOpen] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    holder: '',
    month: '',
    year: '',
    cvv: '',
  });
  
  const [discount, setDiscount] = useState(0);
  const [orderTax, setOrderTax] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);

  // States for new header functions
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCloseRegisterOpen, setIsCloseRegisterOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isRecentTransactionsOpen, setIsRecentTransactionsOpen] = useState(false);

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
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
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
  }, [searchTerm]);

  const addToCart = (product: Product) => {
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
      return [...currentCart, { product, quantity: 1 }];
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

  const clearCart = () => {
    setCart([]);
    toast({
        title: 'Cart Cleared',
        description: 'The transaction has been cancelled.',
    });
  };

  const handleCashPayment = () => {
    if (cart.length === 0) {
        toast({
            title: 'Cart Empty',
            description: 'Add items to the cart before finalizing.',
            variant: 'destructive',
        });
        return;
    }
    toast({
        title: 'Sale Finalized',
        description: 'Payment successful. Cart has been cleared.',
    });
    setCart([]);
  };

  const handleFinalizeMultiPay = () => {
        const cash = parseFloat(cashAmount) || 0;
        const card = parseFloat(cardAmount) || 0;
        const totalPaid = cash + card;

        if (totalPaid < totalPayable) {
            toast({
                title: 'Insufficient Payment',
                description: `Paid amount is less than the total payable of ${formatCurrency(totalPayable)}.`,
                variant: 'destructive',
            });
            return;
        }

        toast({
            title: 'Sale Finalized',
            description: `Payment of ${formatCurrency(totalPaid)} received. Cart has been cleared.`,
        });
        setCart([]);
        setIsMultiPayOpen(false);
        setCashAmount('');
        setCardAmount('');
    };

    const handleDraft = () => {
        if (cart.length === 0) {
          toast({ title: 'Cart Empty', description: 'Please add products to the cart first.', variant: 'destructive' });
          return;
        }
        toast({ title: 'Draft Saved', description: 'The current sale has been saved as a draft.' });
        setCart([]);
      };
    
      const handleQuotation = () => {
        if (cart.length === 0) {
          toast({ title: 'Cart Empty', description: 'Please add products to the cart first.', variant: 'destructive' });
          return;
        }
        toast({ title: 'Quotation Saved', description: 'The current sale has been saved as a quotation.' });
        setCart([]);
      };
      
      const handleSuspend = () => {
        if (cart.length === 0) {
          toast({ title: 'Cart Empty', description: 'Please add products to the cart first.', variant: 'destructive' });
          return;
        }
        toast({ title: 'Sale Suspended', description: 'The current sale has been suspended.' });
        setCart([]);
      };
      
      const handleCreditSale = () => {
        if (cart.length === 0) {
          toast({ title: 'Cart Empty', description: 'Please add products to the cart first.', variant: 'destructive' });
          return;
        }
        toast({ title: 'Credit Sale Finalized', description: 'The sale has been finalized as a credit sale.' });
        setCart([]);
      };
    
      const handleCardPayment = () => {
        if (cart.length === 0) {
          toast({ title: 'Cart Empty', description: 'Please add products to the cart first.', variant: 'destructive' });
          return;
        }
        setIsCardPaymentOpen(true);
      };

      const handleFinalizeCardPayment = () => {
        if (!cardDetails.number || !cardDetails.holder || !cardDetails.month || !cardDetails.year || !cardDetails.cvv) {
            toast({
                title: 'Missing Card Details',
                description: 'Please fill in all card details to proceed.',
                variant: 'destructive',
            });
            return;
        }

        toast({
            title: 'Card Payment Successful',
            description: 'The sale has been finalized with card payment.',
        });
        setCart([]);
        setIsCardPaymentOpen(false);
        setCardDetails({ number: '', holder: '', month: '', year: '', cvv: '' });
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

  return (
    <TooltipProvider>
    <div className="flex flex-col h-[calc(100vh_-_60px)] bg-slate-100 text-slate-900 -m-6 font-sans">
      <header className="bg-white shadow-sm p-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold hidden md:block">Location: <span className="font-bold">Awesome Shop</span></h2>
            <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{time}</span>
            </div>
        </div>
        <div className="flex items-center gap-1">
             <Button variant="ghost" size="icon" className="text-slate-600 hidden sm:flex" onClick={() => setIsRecentTransactionsOpen(true)}><Rewind /></Button>
             <Button variant="ghost" size="icon" className="text-red-500 hidden sm:flex" onClick={clearCart}><X /></Button>
             <Button variant="ghost" size="icon" className="text-slate-600 hidden sm:flex" onClick={() => setIsCloseRegisterOpen(true)}><Briefcase /></Button>
             <Button variant="ghost" size="icon" className="text-slate-600 hidden sm:flex" onClick={() => setIsCalculatorOpen(true)}><Calculator /></Button>
             <Button variant="ghost" size="icon" className="text-slate-600 hidden sm:flex" onClick={handleRefresh}><RefreshCw /></Button>
             <Button variant="ghost" size="icon" className="text-slate-600 hidden sm:flex" onClick={handleToggleFullscreen}>{isFullscreen ? <Shrink/> : <Expand />}</Button>
             <Button variant="ghost" size="icon" className="text-slate-600" onClick={handleCustomerDisplay}><Monitor /></Button>
             <Button variant="ghost" size="icon" className="text-slate-600"><HelpCircle /></Button>
             <Button className="bg-red-500 hover:bg-red-600 text-white h-9 px-3">
                <PlusCircle className="h-4 w-4 sm:mr-2"/> <span className="hidden sm:inline">Add Expense</span>
            </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-8 gap-4 p-4 overflow-hidden">
        
        {/* Left Side: Cart */}
        <div className="lg:col-span-3 flex flex-col gap-2">
            <Card className="p-3 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                        <UserPlus className="text-slate-500 flex-shrink-0"/>
                        <Select defaultValue="walk-in">
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="walk-in">Walk-In Customer</SelectItem>
                            <SelectItem value="john-doe">John Doe</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="icon" className="bg-blue-500 hover:bg-blue-600 text-white flex-shrink-0"><Plus/></Button>
                    </div>
                    <div className="relative flex items-center">
                        <Search className="absolute left-3 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Product name/SKU"
                            className="pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                         <Button size="icon" className="bg-blue-500 hover:bg-blue-600 text-white ml-2 flex-shrink-0"><Plus/></Button>
                    </div>
                </div>
            </Card>

            <Card className="flex-1 flex flex-col bg-white">
                <div className="p-4 flex-grow flex flex-col">
                  <div className="grid grid-cols-12 gap-2 font-bold border-b pb-2 text-sm text-slate-600">
                    <div className="col-span-5 flex items-center">Product <Info className="w-3 h-3 ml-1"/></div>
                    <div className="col-span-2">Quantity</div>
                    <div className="col-span-2">Price</div>
                    <div className="col-span-2">Subtotal</div>
                    <div className="col-span-1 text-center"><X className="w-4 h-4 mx-auto"/></div>
                  </div>
                  <ScrollArea className="flex-grow h-0">
                    <div className="py-2">
                    {cart.length > 0 ? (
                        cart.map((item) => (
                           <div key={item.product.id} className="grid grid-cols-12 gap-2 items-center text-sm mb-2">
                                <div className="col-span-5 font-medium truncate">{item.product.name}</div>
                                <div className="col-span-2">
                                    <Input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 0)} className="h-8 w-16 text-center" />
                                </div>
                                <div className="col-span-2">{formatCurrency(item.product.price)}</div>
                                <div className="col-span-2 font-semibold">{formatCurrency(item.product.price * item.quantity)}</div>
                                <div className="col-span-1 text-center">
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeFromCart(item.product.id)}><X className="w-4 h-4"/></Button>
                                </div>
                           </div>
                        ))
                    ) : (
                        <div className="text-center py-20 text-slate-400">Cart is empty</div>
                    )}
                    </div>
                   </ScrollArea>
                </div>
                <div className="border-t p-3 mt-auto text-sm space-y-2 bg-slate-50">
                    <div className="flex justify-between">
                        <span>Items: <span className="font-semibold">{cart.length} ({cart.reduce((a, b) => a + b.quantity, 0)})</span></span> 
                        <span>Total: <span className="font-semibold">{formatCurrency(subtotal)}</span></span>
                    </div>
                     <div className="flex justify-between items-center text-slate-600">
                        <span className="flex items-center gap-1">Discount (-): 
                            <Tooltip><TooltipTrigger asChild><Info className="w-3 h-3 inline cursor-help"/></TooltipTrigger><TooltipContent>Edit discount</TooltipContent></Tooltip>
                            <Edit2 className="w-3 h-3 inline cursor-pointer" onClick={() => setIsDiscountModalOpen(true)}/>
                        </span> 
                        <span>{formatCurrency(discount)}</span>
                    </div>
                     <div className="flex justify-between items-center text-slate-600">
                        <span className="flex items-center gap-1">Order Tax (+):
                             <Tooltip><TooltipTrigger asChild><Info className="w-3 h-3 inline cursor-help"/></TooltipTrigger><TooltipContent>Edit order tax</TooltipContent></Tooltip>
                            <Edit2 className="w-3 h-3 inline cursor-pointer" onClick={() => setIsTaxModalOpen(true)}/>
                        </span> 
                        <span>{formatCurrency(orderTax)}</span>
                    </div>
                     <div className="flex justify-between items-center text-slate-600">
                        <span className="flex items-center gap-1">Shipping (+):
                             <Tooltip><TooltipTrigger asChild><Info className="w-3 h-3 inline cursor-help"/></TooltipTrigger><TooltipContent>Edit shipping charges</TooltipContent></Tooltip>
                            <Edit2 className="w-3 h-3 inline cursor-pointer" onClick={() => setIsShippingModalOpen(true)}/>
                        </span>
                        <span>{formatCurrency(shipping)}</span>
                    </div>
                </div>
            </Card>
        </div>
        
        {/* Right Side: Product Selection */}
        <div className="lg:col-span-5 flex flex-col gap-2">
           <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => setActiveFilter('category')} className={cn("text-lg py-6", activeFilter === 'category' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-400 hover:bg-slate-500')}><LayoutGrid className="mr-2"/> Category</Button>
              <Button onClick={() => setActiveFilter('brands')} className={cn("text-lg py-6", activeFilter === 'brands' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-400 hover:bg-slate-500')}><Copyright className="mr-2"/> Brands</Button>
           </div>
           <Card className="flex-1 bg-white p-2">
            <ScrollArea className="h-full">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2">
                    {filteredProducts.map(product => (
                        <Card key={product.id} className="cursor-pointer group overflow-hidden" onClick={() => addToCart(product)}>
                            <div className="relative aspect-square bg-slate-50">
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint={productHints[product.id] || 'product item'}
                                />
                            </div>
                            <div className="p-2 text-center bg-white">
                                <p className="text-xs font-semibold truncate">{product.name}</p>
                                <p className="text-xs text-slate-500">({product.sku})</p>
                                <p className="text-sm font-bold text-indigo-600">{formatCurrency(product.price)}</p>
                                <p className="text-xs text-green-600">{product.stock} Pc(s) in stock</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
           </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white shadow-[0_-2px_5px_-1px_rgba(0,0,0,0.1)] p-2 flex flex-col md:flex-row md:items-center md:justify-between z-10 gap-2">
          <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-center md:justify-start">
              <Button variant="outline" className="text-slate-700 hover:bg-slate-100 h-9 px-2 sm:px-4" onClick={handleDraft}><FileText className="h-4 w-4 sm:mr-2"/><span className="hidden sm:inline">Draft</span></Button>
              <Button variant="outline" className="text-slate-700 hover:bg-slate-100 h-9 px-2 sm:px-4" onClick={handleQuotation}><FileText className="h-4 w-4 sm:mr-2"/><span className="hidden sm:inline">Quotation</span></Button>
              <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 h-9 px-2 sm:px-4" onClick={handleSuspend}><Pause className="h-4 w-4 sm:mr-2"/><span className="hidden sm:inline">Suspend</span></Button>
              <Button variant="outline" className="text-slate-700 hover:bg-slate-100 h-9 px-2 sm:px-4" onClick={handleCreditSale}><Undo2 className="h-4 w-4 sm:mr-2"/><span className="hidden sm:inline">Credit Sale</span></Button>
              <Button variant="outline" className="text-slate-700 hover:bg-slate-100 h-9 px-2 sm:px-4" onClick={handleCardPayment}><CreditCard className="h-4 w-4 sm:mr-2"/><span className="hidden sm:inline">Card</span></Button>
          </div>
          <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-center">
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

            <Dialog open={isCardPaymentOpen} onOpenChange={setIsCardPaymentOpen}>
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
                            <Input id="card-number" placeholder="XXXX XXXX XXXX XXXX" value={cardDetails.number} onChange={(e) => setCardDetails(d => ({...d, number: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="card-holder">Card Holder Name</Label>
                            <Input id="card-holder" placeholder="John Doe" value={cardDetails.holder} onChange={(e) => setCardDetails(d => ({...d, holder: e.target.value}))} />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                <Label htmlFor="expiry-month">Expiry Month</Label>
                                <Input id="expiry-month" placeholder="MM" value={cardDetails.month} onChange={(e) => setCardDetails(d => ({...d, month: e.target.value}))} />
                                </div>
                                <div className="space-y-2">
                                <Label htmlFor="expiry-year">Expiry Year</Label>
                                <Input id="expiry-year" placeholder="YYYY" value={cardDetails.year} onChange={(e) => setCardDetails(d => ({...d, year: e.target.value}))} />
                                </div>
                                <div className="space-y-2">
                                <Label htmlFor="cvv">CVV</Label>
                                <Input id="cvv" placeholder="123" value={cardDetails.cvv} onChange={(e) => setCardDetails(d => ({...d, cvv: e.target.value}))} />
                                </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" onClick={handleFinalizeCardPayment}>Finalize Payment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Button className="bg-green-500 hover:bg-green-600 text-xs sm:text-sm" onClick={handleCashPayment}>Cash</Button>
            <Button className="bg-red-500 hover:bg-red-600 text-xs sm:text-sm" onClick={clearCart}>Cancel</Button>
          </div>
          <div className="text-center md:text-right w-full md:w-auto">
              <span className="text-xs sm:text-sm text-slate-500">Total Payable:</span>
              <h3 className="text-lg sm:text-2xl font-bold text-green-600">{formatCurrency(totalPayable)}</h3>
          </div>
      </footer>
      <CalculatorDialog open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen} />
      <CloseRegisterDialog open={isCloseRegisterOpen} onOpenChange={setIsCloseRegisterOpen} totalPayable={totalPayable} />
      <RecentTransactionsDialog open={isRecentTransactionsOpen} onOpenChange={setIsRecentTransactionsOpen} />
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
      <div className="text-center text-xs text-slate-400 p-1 bg-slate-100">
        Ultimate POS - V6.7 | Copyright © 2025 All rights reserved.
      </div>
    </div>
    </TooltipProvider>
  );
}

