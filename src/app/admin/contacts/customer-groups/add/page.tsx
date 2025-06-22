'use client';
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function AddCustomerGroupPage() {
    return (
        <TooltipProvider>
            <div className="flex flex-col gap-6">
                <h1 className="font-headline text-3xl font-bold">Add Customer Group</h1>
                
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Customer Group Details</CardTitle>
                        <CardDescription>Fill in the details below to add a new customer group.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <Label htmlFor="group-name">Customer Group Name *</Label>
                            <Input id="group-name" placeholder="Enter group name" required />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="calculation-percentage" className="flex items-center gap-1.5">
                                Calculation percentage (%)
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">
                                            Selling price group helps you to have different prices for same product for different customers.
                                            Create a selling price group & add variation in selling price for that group.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </Label>
                            <Input id="calculation-percentage" type="number" placeholder="e.g. 10 or -10" />
                            <p className="text-xs text-muted-foreground">
                                It will be calculated on the selling price. <br />
                                You can specify percentage as positive to increase and negative to decrease selling price.
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <Button size="lg">Save</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TooltipProvider>
    );
}
