
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, PlusCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { type CommissionProfile } from '@/lib/data';
import { Textarea } from '@/components/ui/textarea';
import { addCommissionProfile } from '@/services/commissionService';
import { FirebaseError } from 'firebase/app';
import { getProductCategories } from '@/services/productCategoryService';
import { type ProductCategory } from '@/lib/data';
import { useBusinessSettings } from '@/hooks/use-business-settings';
import { useAuth } from '@/hooks/use-auth';

export default function AddSalesCommissionAgentPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user: currentUser } = useAuth();
    const settings = useBusinessSettings();

    const [entityType, setEntityType] = useState<'Agent' | 'Sub-Agent' | 'Company' | 'Salesperson' | ''>('');
    const [agentName, setAgentName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [bankDetails, setBankDetails] = useState('');
    const [overallCommission, setOverallCommission] = useState('');
    const [categoryCommissions, setCategoryCommissions] = useState<{ id: number, category: string, rate: string, categoryId?: string }[]>([]);
    const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categories = await getProductCategories();
                setProductCategories(categories);
            } catch (error) {
                console.error("Failed to fetch product categories", error);
                toast({
                    title: "Error loading categories",
                    description: "Could not load product categories.",
                    variant: "destructive"
                });
            }
        };
        fetchCategories();
    }, [toast]);

    const addCategoryCommission = () => {
        setCategoryCommissions([...categoryCommissions, { id: Date.now(), category: '', rate: '' }]);
    };

    const removeCategoryCommission = (id: number) => {
        setCategoryCommissions(categoryCommissions.filter(c => c.id !== id));
    };

    const handleCategoryCommissionChange = (id: number, field: 'category' | 'rate', value: string) => {
        setCategoryCommissions(
            categoryCommissions.map(comm => {
                if (comm.id === id) {
                    if (field === 'category') {
                        const selectedCategory = productCategories.find(c => c.name === value);
                        return { ...comm, category: value, categoryId: selectedCategory?.id };
                    }
                    return { ...comm, [field]: value };
                }
                return comm;
            })
        );
    };

    const handleSaveProfile = async () => {
        if (settings.modules.advancedCommission && !entityType) {
            toast({
                title: "Error: Missing Field",
                description: "Please select an Entity Type.",
                variant: "destructive",
            });
            return;
        }
        if (!agentName.trim()) {
            toast({
                title: "Error: Missing Field",
                description: "Please enter a Name for the profile.",
                variant: "destructive",
            });
            return;
        }
        if (!phoneNumber.trim()) {
            toast({
                title: "Error: Missing Field",
                description: "Please enter a Phone Number.",
                variant: "destructive",
            });
            return;
        }

        const newProfileData: Omit<CommissionProfile, 'id' | 'totalCommissionEarned' | 'totalCommissionPaid'> = {
            name: agentName,
            entityType: entityType || 'Salesperson',
            phone: phoneNumber,
            email: email || undefined,
            bankDetails: bankDetails || undefined,
            commission: {
                overall: parseFloat(overallCommission) || 0,
                categories: categoryCommissions
                    .filter(c => c.category && c.rate)
                    .map(c => ({
                        category: c.category,
                        rate: parseFloat(c.rate) || 0,
                        categoryId: c.categoryId
                    })),
            }
        };

        const newProfile = {
            ...newProfileData,
            totalCommissionEarned: 0,
            totalCommissionPaid: 0,
        };

        try {
            await addCommissionProfile(newProfile as any, currentUser?.businessId);
            toast({
                title: "Profile Saved!",
                description: `The commission profile for ${agentName} has been created.`,
            });
            router.push('/admin/sales-commission-agents');
        } catch (error) {
            console.error("Failed to add profile:", error);
            if (error instanceof FirebaseError && error.code === 'permission-denied') {
                toast({
                    title: "Permission Error",
                    description: "You don't have permission to add profiles. Please check your Firestore security rules.",
                    variant: "destructive",
                    duration: 9000,
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to save the profile. Please try again.",
                    variant: "destructive",
                });
            }
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold">Add Commission Profile</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Details</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {settings.modules.advancedCommission && (
                                    <div className="space-y-2">
                                        <Label htmlFor="entity-type">Entity Type *</Label>
                                        <Select value={entityType} onValueChange={(value: any) => setEntityType(value)}>
                                            <SelectTrigger id="entity-type">
                                                <SelectValue placeholder="Select an entity type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Agent">Agent</SelectItem>
                                                <SelectItem value="Sub-Agent">Sub-Agent</SelectItem>
                                                <SelectItem value="Company">Company</SelectItem>
                                                <SelectItem value="Salesperson">Salesperson</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="agent-name">Name *</Label>
                                    <Input id="agent-name" placeholder="Enter entity's full name" value={agentName} onChange={(e) => setAgentName(e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone-number">Phone Number *</Label>
                                    <Input id="phone-number" placeholder="Enter phone number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="Enter email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bank-details">Bank Details</Label>
                                <Textarea id="bank-details" placeholder="Enter bank account details" value={bankDetails} onChange={(e) => setBankDetails(e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Commission Rates</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="overall-commission">Overall Commission Rate (%)</Label>
                                <Input id="overall-commission" type="number" placeholder="e.g. 5" value={overallCommission} onChange={(e) => setOverallCommission(e.target.value)} />
                                <p className="text-xs text-muted-foreground">Used if no category-specific rate applies.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Category-Specific Rates</h4>
                                <div className="space-y-4">
                                    {categoryCommissions.map((comm, index) => (
                                        <div key={comm.id} className="flex items-end gap-4 p-4 border rounded-md relative">
                                            <div className="grid grid-cols-2 gap-4 flex-1">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`category-${index}`}>Product Category</Label>
                                                    <Select value={comm.category} onValueChange={(value) => handleCategoryCommissionChange(comm.id, 'category', value)}>
                                                        <SelectTrigger id={`category-${index}`}>
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {productCategories.map(cat => (
                                                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`rate-${index}`}>Commission Rate (%)</Label>
                                                    <Input id={`rate-${index}`} type="number" placeholder="e.g. 10" value={comm.rate} onChange={(e) => handleCategoryCommissionChange(comm.id, 'rate', e.target.value)} />
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => removeCategoryCommission(comm.id)}>
                                                <X className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" className="mt-4" onClick={addCategoryCommission}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Category Commission
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end">
                        <Button size="lg" onClick={handleSaveProfile}>Save Profile</Button>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Instructions</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 text-sm text-muted-foreground space-y-4">
                            <p>Create commission profiles for different entities like Agents, Companies, or Salespersons.</p>
                            <p>You can set an <span className="font-bold text-foreground">Overall Commission Rate</span> that applies to all sales for this profile.</p>
                            <p>Alternatively, you can set <span className="font-bold text-foreground">Category-Specific Rates</span>. If you set even one category rate, the overall rate will be ignored, and commission will only be calculated for products in the specified categories.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
