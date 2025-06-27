'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, PlusCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Textarea } from '@/components/ui/textarea';
import { getCommissionProfile, updateCommissionProfile } from '@/services/commissionService';
import { getProductCategories, type ProductCategory } from '@/services/productCategoryService';
import { Skeleton } from '@/components/ui/skeleton';
import { FirebaseError } from 'firebase/app';
import { useBusinessSettings } from '@/hooks/use-business-settings';

export default function EditSalesCommissionAgentPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const settings = useBusinessSettings();
    const { id } = params;
    
    const [entityType, setEntityType] = useState<'Agent' | 'Sub-Agent' | 'Company' | 'Salesperson' | ''>('');
    const [agentName, setAgentName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [bankDetails, setBankDetails] = useState('');
    const [overallCommission, setOverallCommission] = useState('');
    const [categoryCommissions, setCategoryCommissions] = useState<{id: number, category: string, rate: string}[]>([]);
    const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        if (typeof id !== 'string') return;
        
        const fetchProfileAndCategories = async () => {
            setIsLoading(true);
            try {
                const [profileToEdit, categories] = await Promise.all([
                    getCommissionProfile(id),
                    getProductCategories()
                ]);

                setProductCategories(categories);

                if (profileToEdit) {
                    setEntityType(profileToEdit.entityType);
                    setAgentName(profileToEdit.name);
                    setPhoneNumber(profileToEdit.phone);
                    setEmail(profileToEdit.email || '');
                    setBankDetails(profileToEdit.bankDetails || '');
                    setOverallCommission(String(profileToEdit.commission.overall));
                    setCategoryCommissions(
                        profileToEdit.commission.categories?.map((c, index) => ({
                            id: Date.now() + index,
                            category: c.category,
                            rate: String(c.rate),
                        })) || []
                    );
                } else {
                    toast({
                        title: "Error",
                        description: "Commission profile not found.",
                        variant: "destructive"
                    });
                    router.push('/admin/sales-commission-agents');
                }
            } catch (error) {
                 toast({
                    title: "Error",
                    description: "Failed to load profile data.",
                    variant: "destructive"
                });
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileAndCategories();
    }, [id, router, toast]);

    const addCategoryCommission = () => {
        setCategoryCommissions([...categoryCommissions, { id: Date.now(), category: '', rate: '' }]);
    };

    const removeCategoryCommission = (id: number) => {
        setCategoryCommissions(categoryCommissions.filter(c => c.id !== id));
    };

    const handleCategoryCommissionChange = (id: number, field: 'category' | 'rate', value: string) => {
        setCategoryCommissions(
            categoryCommissions.map(comm => 
                comm.id === id ? { ...comm, [field]: value } : comm
            )
        );
    };

    const handleUpdateProfile = async () => {
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
        if (!overallCommission.trim() && categoryCommissions.length === 0) {
            toast({
                title: "Error: Missing Field",
                description: "Please enter an Overall Commission Rate or define at least one category-specific rate.",
                variant: "destructive",
            });
            return;
        }

        const updatedProfileData = {
            name: agentName,
            entityType: entityType as any,
            phone: phoneNumber,
            email: email,
            bankDetails: bankDetails,
            commission: {
                overall: parseFloat(overallCommission) || 0,
                categories: categoryCommissions
                    .filter(c => c.category && c.rate)
                    .map(c => ({
                        category: c.category,
                        rate: parseFloat(c.rate)
                    })),
            }
        };

        try {
            await updateCommissionProfile(id as string, updatedProfileData);
            toast({
                title: "Profile Updated!",
                description: `The commission profile for ${agentName} has been updated.`,
            });
            router.push('/admin/sales-commission-agents');
        } catch (error) {
            console.error("Failed to update profile:", error);
            if (error instanceof FirebaseError && error.code === 'permission-denied') {
                toast({
                    title: "Permission Error",
                    description: "You don't have permission to update this profile. Please check your Firestore security rules.",
                    variant: "destructive",
                    duration: 9000,
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to update the profile. Please try again.",
                    variant: "destructive",
                });
            }
        }
    };

    if (isLoading) {
        return (
             <div className="flex flex-col gap-6">
                <h1 className="font-headline text-3xl font-bold"><Skeleton className="h-9 w-72" /></h1>
                <Card>
                    <CardHeader><CardTitle><Skeleton className="h-7 w-48" /></CardTitle></CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-10 w-full" /></div>
                            <div className="space-y-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-10 w-full" /></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold">Edit Commission Profile</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
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
                            <div className="space-y-2">
                                <Label htmlFor="overall-commission">Overall Commission Rate (%) *</Label>
                                <Input id="overall-commission" type="number" placeholder="e.g. 5" value={overallCommission} onChange={(e) => setOverallCommission(e.target.value)} disabled={categoryCommissions.length > 0} />
                                <p className="text-xs text-muted-foreground">
                                    {categoryCommissions.length > 0 
                                        ? "Disabled because category-specific rates are being used."
                                        : "This is the default commission rate if no category-specific rate applies."
                                    }
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Category-Specific Commission Rates</CardTitle>
                            <CardDescription>
                                Add specific commission rates for different product categories. These will override the overall rate.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
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
                        </CardContent>
                    </Card>
                    <div className="flex justify-end">
                        <Button size="lg" onClick={handleUpdateProfile}>Update Profile</Button>
                    </div>
                </div>
                <div className="lg:col-span-1">
                     <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Instructions</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 text-sm text-muted-foreground space-y-4">
                             <p>Update the commission profile details for the selected entity.</p>
                            <p>Adjust the profile details and commission structure as needed.</p>
                             <p>Click "Update Profile" to save your changes.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
