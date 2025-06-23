'use client';
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useParams } from 'next/navigation';

const permissionGroups = [
    { key: 'user', title: 'User', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'role', title: 'Role', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'supplier', title: 'Supplier', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'customer', title: 'Customer', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'product', title: 'Product', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'purchase', title: 'Purchase & Stock Transfer', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'sell', title: 'Sell', permissions: ['access_pos', 'add', 'edit', 'delete'], labels: { access_pos: 'Access POS' } },
    { key: 'brand', title: 'Brand', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'tax_rate', title: 'Tax rate', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'unit', title: 'Unit', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'category', title: 'Category', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'report', title: 'Report', permissions: ['view_purchase_sell', 'view_supplier_customer', 'view_expense', 'view_profit_loss', 'view_stock', 'view_stock_adjustment', 'view_trending_product', 'view_register', 'view_sales_representative', 'view_tax', 'view_product_stock_value'], labels: { view_purchase_sell: 'View purchase & sell report', view_supplier_customer: 'View supplier & customer report', view_expense: 'View expense report', view_profit_loss: 'View profit & loss report', view_stock: 'View stock report', view_stock_adjustment: 'View stock adjustment report', view_trending_product: 'View trending product report', view_register: 'View register report', view_sales_representative: 'View sales representative report', view_tax: 'View tax report', view_product_stock_value: 'View product stock value report' } },
    { key: 'business_settings', title: 'Business Settings', permissions: ['access'] },
    { key: 'barcode', title: 'Barcode', permissions: ['access'] },
    { key: 'invoice', title: 'Invoice', permissions: ['access'] },
    { key: 'expense', title: 'Expense', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'stock_transfer', title: 'Stock Transfer', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'stock_adjustment', title: 'Stock Adjustment', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'purchase_requisition', title: 'Purchase Requisition', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'sales_order', title: 'Sales Order', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'hms', title: 'HMS', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'manufacturing', title: 'Manufacturing', permissions: ['access'] },
    { key: 'project', title: 'Project', permissions: ['access'] },
    { key: 'woocommerce', title: 'Woocommerce', permissions: ['access'] },
    { key: 'sales_commission_agent', title: 'Sales Commission Agent', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'restaurant', title: 'Restaurant', permissions: ['access'] },
    { key: 'booking', title: 'Booking', permissions: ['access'] },
    { key: 'kitchen', title: 'Kitchen', permissions: ['access'] },
    { key: 'subscription', title: 'Subscription', permissions: ['access'] },
    { key: 'account', title: 'Account', permissions: ['access'] },
    { key: 'types_of_service', title: 'Types of service', permissions: ['access'] },
    { key: 'payment_accounts', title: 'Payment Accounts', permissions: ['view', 'access', 'add', 'edit', 'delete'] },
    { key: 'essentials', title: 'Essentials', permissions: ['access'] },
    { key: 'hrm', title: 'hrm', permissions: ['access'] },
];

type PermissionsState = Record<string, Record<string, boolean>>;

export default function EditRolePage() {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [roleName, setRoleName] = useState('');
    const [permissions, setPermissions] = useState<PermissionsState>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // In a real app, you would fetch the role data from an API using the `id`.
        // For this demo, we'll simulate fetching data for the "Admin" role.
        if (id === 'role-1') {
            setRoleName('Admin');
            // For an admin, all permissions would typically be true.
            const allPermissions: PermissionsState = {};
            permissionGroups.forEach(group => {
                allPermissions[group.key] = {};
                group.permissions.forEach(perm => {
                    allPermissions[group.key][perm] = true;
                });
            });
            setPermissions(allPermissions);
        } else if (id === 'role-2') {
             setRoleName('Cashier');
             // Simulate cashier permissions
             const cashierPermissions: PermissionsState = {
                 sell: { access_pos: true, add: true, edit: true, delete: false },
                 customer: { view: true, add: true, edit: false, delete: false },
             };
             setPermissions(cashierPermissions);
        }
        setIsLoading(false);
    }, [id]);

    const handlePermissionChange = (groupKey: string, permissionKey: string, checked: boolean) => {
        setPermissions(prev => ({
            ...prev,
            [groupKey]: {
                ...prev[groupKey],
                [permissionKey]: checked
            }
        }));
    };

    const handleGroupToggle = (groupKey: string, permissionsList: string[], checked: boolean) => {
        const groupPermissions = permissionsList.reduce((acc, p) => ({ ...acc, [p]: checked }), {});
        setPermissions(prev => ({
            ...prev,
            [groupKey]: groupPermissions
        }));
    };

    const isGroupChecked = (groupKey: string, permissionsList: string[]) => {
        return permissionsList.every(p => permissions[groupKey]?.[p]);
    };

    const handleSaveRole = () => {
        if (!roleName.trim()) {
            toast({
                title: "Validation Error",
                description: "Role name is required.",
                variant: "destructive",
            });
            return;
        }
        console.log("Updating Role:", { roleId: id, roleName, permissions });
        toast({
            title: "Role Updated",
            description: `The role "${roleName}" has been updated successfully.`
        });
        router.push('/admin/roles');
    };

    if (isLoading) {
        return <div>Loading role details...</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold">Edit Role</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Role Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 max-w-sm">
                        <Label htmlFor="role-name">Role name *</Label>
                        <Input id="role-name" placeholder="Enter role name" value={roleName} onChange={(e) => setRoleName(e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Permissions</CardTitle>
                    <CardDescription>Select the permissions for this role.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="multiple" className="w-full" defaultValue={Object.keys(permissions)}>
                        {permissionGroups.map(group => (
                            <AccordionItem value={group.key} key={group.key}>
                                <AccordionTrigger>
                                    <div className="flex items-center gap-4">
                                        <Checkbox 
                                            id={`group-select-${group.key}`} 
                                            onCheckedChange={(checked) => handleGroupToggle(group.key, group.permissions, !!checked)}
                                            checked={isGroupChecked(group.key, group.permissions)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <span className="font-semibold">{group.title}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pl-10 pt-4">
                                        {group.permissions.map(perm => (
                                            <div key={perm} className="flex items-center space-x-2">
                                                <Checkbox 
                                                    id={`${group.key}-${perm}`} 
                                                    checked={!!permissions[group.key]?.[perm]}
                                                    onCheckedChange={(checked) => handlePermissionChange(group.key, perm, !!checked)}
                                                />
                                                <Label htmlFor={`${group.key}-${perm}`} className="font-normal capitalize">
                                                    {(group.labels as any)?.[perm] || perm.replace(/_/g, ' ')}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button size="lg" onClick={handleSaveRole}>Update</Button>
            </div>
        </div>
    );
}
