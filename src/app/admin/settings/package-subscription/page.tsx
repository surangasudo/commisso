'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Box, ArrowRight } from "lucide-react";
import Link from "next/link";

const currentPlan = {
  name: 'Premium',
  price: '99.00',
  billingCycle: 'monthly',
  nextBillingDate: 'July 25, 2025',
  features: [
    'Unlimited Products',
    'Unlimited Users',
    'Advanced Reporting',
    '24/7 Priority Support',
    'API Access',
  ],
};

export default function PackageSubscriptionPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <Box className="w-8 h-8" />
        Package Subscription
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Current Plan</CardTitle>
          <CardDescription>
            Manage your subscription and view billing history.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-primary/10 p-6 rounded-lg">
                <h3 className="text-2xl font-bold text-primary">{currentPlan.name} Plan</h3>
                <p className="text-4xl font-bold mt-2">${currentPlan.price}<span className="text-base font-normal text-muted-foreground">/{currentPlan.billingCycle}</span></p>
                <p className="text-sm text-muted-foreground mt-1">Next billing date: {currentPlan.nextBillingDate}</p>

                <ul className="mt-6 space-y-2">
                    {currentPlan.features.map(feature => (
                        <li key={feature} className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <span className="text-sm">{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col justify-center">
                 <h3 className="text-lg font-semibold">Manage Your Subscription</h3>
                 <p className="text-muted-foreground mt-2">
                    Need to change your plan, update your payment method, or view your billing history? 
                    Visit our secure billing portal to manage all aspects of your subscription.
                 </p>
                 <Button className="mt-4 w-fit">
                    Go to Billing Portal <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>

                 <div className="mt-8 border-t pt-6">
                    <h4 className="font-semibold">Need help?</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                        If you have any questions about your subscription, please{' '}
                        <Link href="#" className="text-primary underline">
                            contact our support team
                        </Link>
                        .
                    </p>
                 </div>
            </div>
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground">
                Your subscription is managed by our secure payment partner. We do not store your credit card information on our servers.
            </p>
         </CardFooter>
      </Card>
       <div className="text-center text-xs text-slate-400 p-1">
        Ultimate POS - V6.7 | Copyright © 2025 All rights reserved.
      </div>
    </div>
  );
}
