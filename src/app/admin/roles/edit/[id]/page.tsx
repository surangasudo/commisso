'use client';
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useParams } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

const permissionGroups = [
    { key: 'user', title: 'User', permissions: ['view', 'add', 'edit', 'delete'], hasViewRadio: true, labels: { view_all: "View all users", view_own: "View own user", add: 'Add User', edit: 'Edit User', delete: 'Delete User' } },
    { key: 'role', title: 'Role', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'supplier', title: 'Supplier', permissions: ['view', 'add', 'edit', 'delete'], hasViewRadio: true, labels: { view_all: "View all suppliers", view_own: "View own suppliers", add: 'Add Supplier', edit: 'Edit Supplier', delete: 'Delete Supplier' } },
    { key: 'customer', title: 'Customer', permissions: ['view', 'add', 'edit', 'delete'], hasViewRadio: true, labels: { view_all: "View all customers", view_own: "View own customers", add: 'Add Customer', edit: 'Edit Customer', delete: 'Delete Customer' } },
    { key: 'product', title: 'Product', permissions: ['view', 'add', 'edit', 'delete', 'opening_stock', 'import'], labels: { opening_stock: 'Add Opening Stock', import: 'Import Products' } },
    { key: 'purchase', title: 'Purchase & Stock Transfer', permissions: ['view', 'add', 'edit', 'delete', 'payments', 'update_status'], hasViewRadio: true, labels: { view_all: "View all purchases & stock transfers", view_own: "View own purchases & stock transfers", payments: 'Add/Edit/Delete Payments', update_status: 'Update Status' } },
    { key: 'sell', title: 'Sell', permissions: ['view', 'add', 'edit', 'delete', 'payments', 'access_pos', 'access_all_sales'], hasViewRadio: true, labels: { view_all: 'View all sales', view_own: 'View own sales', payments: 'Add/Edit/Delete Payments', access_pos: 'Access POS', access_all_sales: 'Access all sales' } },
    { key: 'draft', title: 'Draft', permissions: ['view', 'edit', 'delete'], hasViewRadio: true, labels: { view_all: 'View all drafts', view_own: 'View own drafts' } },
    { key: 'quotation', title: 'Quotation', permissions: ['view', 'edit', 'delete'], hasViewRadio: true, labels: { view_all: 'View all quotations', view_own: 'View own quotations' } },
    { key: 'brand', title: 'Brand', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'tax_rate', title: 'Tax rate', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'unit', title: 'Unit', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'category', title: 'Category', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'report', title: 'Report', permissions: ['view'] },
    { key: 'business_settings', title: 'Business Settings', permissions: ['access'] },
    { key: 'barcode', title: 'Barcode Settings', permissions: ['access'], labels: { access: 'Create/Edit Barcodes setting' } },
    { key: 'invoice', title: 'Invoice Settings', permissions: ['access'], labels: { access: 'Create/Edit Invoice setting' } },
    { key: 'expense', title: 'Expense', permissions: ['view', 'add', 'edit', 'delete'], hasViewRadio: true, labels: { view_all: 'View all expenses', view_own: 'View own expenses' } },
    { key: 'stock_transfer', title: 'Stock Transfer', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'stock_adjustment', title: 'Stock Adjustment', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'purchase_requisition', title: 'Purchase Requisition', permissions: ['view', 'add', 'edit', 'delete', 'approve'], hasViewRadio: true, labels: { view_all: 'View all purchase requisitions', view_own: 'View own purchase requisitions' } },
    { key: 'sales_order', title: 'Sales Order', permissions: ['view', 'add', 'edit', 'delete', 'approve'], hasViewRadio: true, labels: { view_all: 'View all sales orders', view_own: 'View own sales orders' } },
    { key: 'account', title: 'Account', permissions: ['access'] },
    { key: 'hms', title: 'HMS', permissions: ['access'] },
    { key: 'manufacturing', title: 'Manufacturing', permissions: ['access'] },
    { key: 'project', title: 'Project', permissions: ['access'] },
    { key: 'woocommerce', title: 'Woocommerce', permissions: ['access'] },
    { key: 'essentials', title: 'Essentials', permissions: ['access'] },
    { key: 'hrm', title: 'HRM', permissions: ['access'] },
    { key: 'sales_commission_agent', title: 'Sales Commission Agent', permissions: ['view', 'add', 'edit', 'delete'] },
    { key: 'subscription', title: 'Subscription', permissions: ['access'], labels: { access: 'Access subscription' } },
    { key: 'types_of_service', title: 'Types of service', permissions: ['access'] },
];

type PermissionsState = Record<string, Record<string, boolean | string>>;

export default function EditRolePage() {
    const { toast } = useToast();
    const router = useRouter();
    const { id } = useParams();

    const [roleName, setRoleName] = useState('');
    const [permissions, setPermissions] = useState<PermissionsState>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // In a real app, you would fetch the role data from an API using the `id`.
        if (id === 'role-1') { // Admin
            setRoleName('Admin');
            const allPermissions: PermissionsState = {};
            permissionGroups.forEach(group => {
                allPermissions[group.key] = {};
                group.permissions.forEach(perm => {
                    allPermissions[group.key][perm] = true;
                });
                if (group.hasViewRadio) {
                     allPermissions[group.key]['view'] = 'all';
                }
            });
            setPermissions(allPermissions);
        } else if (id === 'role-2') { // Cashier
             setRoleName('Cashier');
             const cashierPermissions: PermissionsState = {
                 sell: { view: 'own', access_pos: true, add: true, edit: true, delete: false },
                 customer: { view: 'all', add: true, edit: false, delete: false },
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

    const handleViewPermissionChange = (groupKey: string, value: string) => {
        setPermissions(prev => ({
            ...prev,
            [groupKey]: {
                ...prev[groupKey],
                view: value,
            }
        }));
    };

    const handleGroupToggle = (groupKey: string, groupPermissions: string[], hasViewRadio?: boolean, checked?: boolean) => {
        const newGroupState: Record<string, boolean | string> = {};
        groupPermissions.forEach(p => {
            newGroupState[p] = !!checked;
        });
        if (hasViewRadio) {
            newGroupState['view'] = checked ? 'all' : 'none';
        }
        setPermissions(prev => ({
            ...prev,
            [groupKey]: newGroupState
        }));
    };

    const isGroupChecked = (groupKey: string, permissionsList: string[], hasViewRadio?: boolean) => {
        const groupState = permissions[groupKey];
        if (!groupState) return false;

        // Check every permission in the list.
        for (const perm of permissionsList) {
            // For radio-controlled 'view', it must be 'all' to be considered fully checked.
            if (hasViewRadio && perm === 'view') {
                if (groupState[perm] !== 'all') {
                    return false;
                }
            } else {
                // For regular checkboxes, it must be truthy.
                if (!groupState[perm]) {
                    return false;
                }
            }
        }
        
        // If we get here, all conditions passed.
        return true;
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
                                <AccordionPrimitive.Header className="flex w-full items-center">
                                    <div className="flex items-center py-4 pl-4">
                                        <Checkbox 
                                            id={`group-select-${group.key}`} 
                                            onCheckedChange={(checked) => handleGroupToggle(group.key, group.permissions, group.hasViewRadio, !!checked)}
                                            checked={isGroupChecked(group.key, group.permissions, group.hasViewRadio)}
                                        />
                                    </div>
                                    <AccordionPrimitive.Trigger
                                        className="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180 px-4"
                                    >
                                        <span className="font-semibold">{group.title}</span>
                                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                                    </AccordionPrimitive.Trigger>
                                </AccordionPrimitive.Header>
                                <AccordionContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 pl-10 pt-4">
                                       {group.hasViewRadio && (
                                          <div className="col-span-full">
                                              <RadioGroup
                                                  value={permissions[group.key]?.view as string || 'none'}
                                                  onValueChange={(value) => handleViewPermissionChange(group.key, value)}
                                                  className="flex gap-4 mt-2"
                                              >
                                                  <div className="flex items-center space-x-2">
                                                      <RadioGroupItem value="all" id={`${group.key}-view-all`} />
                                                      <Label htmlFor={`${group.key}-view-all`} className="font-normal">{group.labels?.view_all || `View all ${group.key}s`}</Label>
                                                  </div>
                                                  <div className="flex items-center space-x-2">
                                                      <RadioGroupItem value="own" id={`${group.key}-view-own`} />
                                                      <Label htmlFor={`${group.key}-view-own`} className="font-normal">{group.labels?.view_own || `View own ${group.key}`}</Label>
                                                  </div>
                                              </RadioGroup>
                                          </div>
                                        )}
                                        {group.permissions.filter(p => !(group.hasViewRadio && p === 'view')).map(perm => (
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
