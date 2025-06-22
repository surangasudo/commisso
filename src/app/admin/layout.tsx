'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  CircleUser,
  Home,
  Users,
  Contact,
  Package,
  Download,
  Upload,
  ArrowRightLeft,
  SlidersHorizontal,
  Wallet,
  Landmark,
  FileText,
  Mail,
  Settings,
  Briefcase,
  CheckSquare,
  ShoppingCart,
  Grid3x3,
  CalendarDays,
  PlusCircle,
  ChevronDown,
} from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Logo } from '@/components/icons';

const sidebarNav = [
    { href: "/admin/dashboard", icon: Home, label: "Home" },
    { 
        label: "User Management", 
        icon: Users,
        children: [
            { href: "/admin/users", label: "Users" },
            { href: "/admin/roles", label: "Roles" },
            { href: "/admin/sales-commission-agents", label: "Sales Commission Agents" }
        ]
    },
    { 
        label: "Contacts", 
        icon: Contact,
        children: [
            { href: "/admin/contacts/suppliers", label: "Suppliers" },
            { href: "/admin/contacts/customers", label: "Customers" },
            { href: "/admin/contacts/customer-groups", label: "Customer Groups" },
            { href: "/admin/contacts/import", label: "Import Contacts" },
        ]
    },
    { href: "/admin/inventory", icon: Package, label: "Products" },
    { href: "/admin/purchases", icon: Download, label: "Purchases" },
    { href: "/admin/sales", icon: Upload, label: "Sell" },
    { href: "#", icon: ArrowRightLeft, label: "Stock Transfers" },
    { href: "#", icon: SlidersHorizontal, label: "Stock Adjustment" },
    { href: "/admin/expenses", icon: Wallet, label: "Expenses" },
    { href: "#", icon: Landmark, label: "Payment Accounts" },
    { href: "/admin/reports", icon: FileText, label: "Reports" },
    { href: "#", icon: Mail, label: "Notification Templates" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    const activeParent = sidebarNav.find(item => 
      item.children?.some(child => pathname.startsWith(child.href))
    );
    if (activeParent) {
      setOpenMenu(activeParent.label);
    }
  }, [pathname]);

  const toggleMenu = (label: string) => {
    setOpenMenu(openMenu === label ? null : label);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarMenu>
            {sidebarNav.map((item) => (
                 <SidebarMenuItem key={item.label}>
                    {item.children ? (
                        <>
                        <SidebarMenuButton
                            variant={openMenu === item.label || item.children.some(c => pathname.startsWith(c.href)) ? 'secondary' : 'ghost'}
                            className="w-full justify-between"
                            onClick={() => toggleMenu(item.label)}
                        >
                            <div className="flex items-center gap-2">
                            <item.icon />
                            <span>{item.label}</span>
                            </div>
                            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${openMenu === item.label ? 'rotate-180' : ''}`} />
                        </SidebarMenuButton>
                        {openMenu === item.label && (
                            <ul className="pl-7 pt-2 flex flex-col gap-1">
                            {item.children.map((child) => (
                                <li key={child.label}>
                                <Link href={child.href} className="w-full">
                                    <SidebarMenuButton 
                                    tooltip={child.label} 
                                    variant={pathname === child.href ? 'secondary' : 'ghost'} 
                                    className="w-full justify-start h-8 text-sm"
                                    >
                                    <span>{child.label}</span>
                                    </SidebarMenuButton>
                                </Link>
                                </li>
                            ))}
                            </ul>
                        )}
                        </>
                    ) : (
                        <Link href={item.href!} className="w-full">
                            <SidebarMenuButton tooltip={item.label} variant={pathname === item.href ? 'primary' : 'ghost'}>
                            <item.icon />
                            <span>{item.label}</span>
                            </SidebarMenuButton>
                        </Link>
                    )}
                </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="gap-2">
            <Button style={{backgroundColor: 'hsl(258, 42%, 58%)', color: 'white'}} className="justify-start w-full hover:bg-[hsl(258,42%,50%)]">
                <Briefcase className="mr-2 h-4 w-4" /> HRM
            </Button>
            <Button style={{backgroundColor: 'hsl(220, 77%, 45%)', color: 'white'}} className="justify-start w-full hover:bg-[hsl(220,77%,40%)]">
                <CheckSquare className="mr-2 h-4 w-4" /> Essentials
            </Button>
             <Button style={{backgroundColor: 'hsl(308, 47%, 55%)', color: 'white'}} className="justify-start w-full hover:bg-[hsl(308,47%,50%)]">
                <ShoppingCart className="mr-2 h-4 w-4" /> Woocommerce
            </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-primary text-primary-foreground px-4 lg:h-[60px] lg:px-6">
          <div className="flex items-center gap-4">
             <SidebarTrigger className="lg:hidden text-primary-foreground" />
             <div className="hidden items-center gap-2 lg:flex">
                <Logo className="size-7" />
                <span className="font-headline text-lg">Awesome Shop</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex"><Download className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex"><PlusCircle className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="rounded-full"><Grid3x3 className="h-5 w-5" /></Button>
            <Link href="/admin/pos">
                <Button variant="ghost" size="icon" className="rounded-full">
                    <ShoppingCart className="h-5 w-5" />
                </Button>
            </Link>
            <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex"><CalendarDays className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <CircleUser className="h-6 w-6" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Admin</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 bg-background">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
