
'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, AlertTriangle } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { AppFooter } from '@/components/app-footer';

const availableTags = {
  sendLedger: ["{business_name}", "{business_logo}"],
  customer: [
    "{invoice_number}", "{total_amount}", "{paid_amount}", "{due_amount}", "{due_date}",
    "{business_name}", "{location_address}", "{location_email}", "{location_phone}",
    "{location_custom_field_1}", "{location_custom_field_2}", "{location_custom_field_3}", "{location_custom_field_4}",
    "{contact_name}", "{contact_custom_field_1}", "{contact_custom_field_2}", "{contact_custom_field_3}",
    "{contact_custom_field_4}", "{contact_custom_field_5}", "{contact_custom_field_6}", "{contact_custom_field_7}",
    "{contact_custom_field_8}", "{contact_custom_field_9}", "{contact_custom_field_10}",
    "{shipping_custom_field_1}", "{shipping_custom_field_2}", "{shipping_custom_field_3}",
    "{shipping_custom_field_4}", "{shipping_custom_field_5}",
  ],
  supplier: [
    "{order_ref_number}", "{total_amount}", "{received_amount}",
    "{business_name}", "{location_address}", "{location_email}", "{location_phone}",
    "{location_custom_field_1}", "{location_custom_field_2}", "{location_custom_field_3}", "{location_custom_field_4}",
    "{contact_name}", "{contact_custom_field_1}", "{contact_custom_field_2}", "{contact_custom_field_3}",
    "{contact_custom_field_4}", "{contact_custom_field_5}", "{contact_custom_field_6}", "{contact_custom_field_7}",
    "{contact_custom_field_8}", "{contact_custom_field_9}", "{contact_custom_field_10}",
    "{shipping_custom_field_1}", "{shipping_custom_field_2}", "{shipping_custom_field_3}",
    "{shipping_custom_field_4}", "{shipping_custom_field_5}",
  ],
  salesRepresentative: [
    "{representative_name}",
    "{business_name}",
    "{location_name}",
    "{location_phone}",
    "{commission_amount}",
    "{total_sale_amount}",
    "{reporting_period_start}",
    "{reporting_period_end}",
  ],
};


const TemplateForm = ({ tags, emailSubject, emailBody, smsBody, whatsappText }: {
  tags: string[],
  emailSubject?: string,
  emailBody?: string,
  smsBody?: string,
  whatsappText?: string
}) => {
    return (
        <div className="space-y-4">
            <div>
                <Label>Available Tags:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                    {tags.map(tag => <Badge key={tag} variant="outline" className="font-mono">{tag}</Badge>)}
                </div>
            </div>
            <Tabs defaultValue="email" className="w-full">
                <TabsList>
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="sms">SMS</TabsTrigger>
                    <TabsTrigger value="whatsapp">Whatsapp</TabsTrigger>
                </TabsList>
                <TabsContent value="email" className="pt-4 space-y-4">
                    {emailSubject !== undefined && (
                        <div className="space-y-2">
                            <Label htmlFor="subject">Email Subject:</Label>
                            <Input id="subject" defaultValue={emailSubject} />
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cc">CC:</Label>
                            <Input id="cc" placeholder="Comma separated emails"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bcc">BCC:</Label>
                            <Input id="bcc" placeholder="Comma separated emails"/>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Email Body:</Label>
                        <Textarea defaultValue={emailBody} rows={8} />
                    </div>
                </TabsContent>
                <TabsContent value="sms" className="pt-4 space-y-4">
                    <div className="space-y-2">
                        <Label>SMS Body:</Label>
                        <Textarea defaultValue={smsBody} rows={4} />
                    </div>
                </TabsContent>
                <TabsContent value="whatsapp" className="pt-4 space-y-4">
                    <div className="space-y-2">
                        <Label>Whatsapp Text:</Label>
                        <Textarea defaultValue={whatsappText} rows={4} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default function NotificationTemplatesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <Mail className="w-8 h-8" />
        Notification Templates
      </h1>

      {/* General Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="send-ledger" className="w-full">
            <TabsList>
              <TabsTrigger value="send-ledger">Send Ledger</TabsTrigger>
            </TabsList>
            <TabsContent value="send-ledger" className="pt-4">
              <TemplateForm
                tags={availableTags.sendLedger}
                emailSubject="Ledger from {business_name}"
                emailBody=""
                smsBody=""
                whatsappText=""
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Customer Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="new-sale" className="w-full">
            <TabsList className="flex-wrap h-auto justify-start">
              <TabsTrigger value="new-sale">New Sale</TabsTrigger>
              <TabsTrigger value="payment-received">Payment Received</TabsTrigger>
              <TabsTrigger value="payment-reminder">Payment Reminder</TabsTrigger>
              <TabsTrigger value="new-booking">New Booking</TabsTrigger>
              <TabsTrigger value="new-quotation">New Quotation</TabsTrigger>
            </TabsList>
            <TabsContent value="new-sale" className="pt-4">
              <TemplateForm
                tags={availableTags.customer}
                emailSubject="Thank you from {business_name}"
                emailBody={`Dear {contact_name},\n\nYour invoice number is {invoice_number}\nTotal amount: {total_amount}\nPaid amount: {received_amount}\n\nThank you for shopping with us.\n\n{business_logo}`}
                smsBody="Dear {contact_name}, Thank you for shopping at {business_name}."
                whatsappText="Dear {contact_name}, Thank you for shopping at {business_name}."
              />
            </TabsContent>
             <TabsContent value="payment-received" className="pt-4">
                <TemplateForm tags={availableTags.customer} emailSubject="Payment Received" emailBody="Dear {contact_name}, We have received a payment of {paid_amount} against invoice {invoice_number}. Thank you." smsBody="" whatsappText=""/>
            </TabsContent>
            <TabsContent value="payment-reminder" className="pt-4">
                <TemplateForm tags={availableTags.customer} emailSubject="Payment Reminder" emailBody="Dear {contact_name}, This is a reminder for your due payment of {due_amount} for invoice {invoice_number}." smsBody="" whatsappText=""/>
            </TabsContent>
             <TabsContent value="new-booking" className="pt-4">
                <TemplateForm tags={availableTags.customer} emailSubject="New Booking Confirmation" emailBody="Dear {contact_name}, Your booking for invoice {invoice_number} is confirmed." smsBody="" whatsappText=""/>
            </TabsContent>
             <TabsContent value="new-quotation" className="pt-4">
                <TemplateForm tags={availableTags.customer} emailSubject="New Quotation" emailBody="Dear {contact_name}, Here is your quotation for invoice {invoice_number}." smsBody="" whatsappText=""/>
            </TabsContent>
          </Tabs>
           <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="auto-email-customer" />
                <Label htmlFor="auto-email-customer" className="font-normal">Auto Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="auto-sms-customer" />
                <Label htmlFor="auto-sms-customer" className="font-normal">Auto Send SMS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="auto-whatsapp-customer" />
                <Label htmlFor="auto-whatsapp-customer" className="font-normal">Auto send Whatsapp notification</Label>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">If enabled, set notification will be automatically sent to customer on creating new sale.</p>
        </CardContent>
      </Card>
      
      {/* Supplier Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="new-order" className="w-full">
            <TabsList className="flex-wrap h-auto justify-start">
              <TabsTrigger value="new-order">New Order</TabsTrigger>
              <TabsTrigger value="payment-paid">Payment Paid</TabsTrigger>
              <TabsTrigger value="items-received">Items Received</TabsTrigger>
              <TabsTrigger value="items-pending">Items Pending</TabsTrigger>
              <TabsTrigger value="purchase-order">Purchase Order</TabsTrigger>
            </TabsList>
            <TabsContent value="new-order" className="pt-4">
                <TemplateForm
                    tags={availableTags.supplier}
                    emailSubject="New Order from {business_name}"
                    emailBody={`Dear {contact_name},\n\nWe have a new order with reference number {order_ref_number}. Kindly process the products as soon as possible.\n\n{business_name}\n{business_logo}`}
                    smsBody="Dear {contact_name}, We have a new order with reference number {order_ref_number}. Kindly process the products as soon as possible. {business_name}"
                    whatsappText="Dear {contact_name}, We have a new order with reference number {order_ref_number}. Kindly process the products as soon as possible. {business_name}"
                />
            </TabsContent>
             <TabsContent value="payment-paid" className="pt-4">
                <TemplateForm tags={availableTags.supplier} emailSubject="Payment Paid" emailBody="" smsBody="" whatsappText=""/>
            </TabsContent>
             <TabsContent value="items-received" className="pt-4">
                <TemplateForm tags={availableTags.supplier} emailSubject="Items Received" emailBody="" smsBody="" whatsappText=""/>
            </TabsContent>
             <TabsContent value="items-pending" className="pt-4">
                <TemplateForm tags={availableTags.supplier} emailSubject="Items Pending" emailBody="" smsBody="" whatsappText=""/>
            </TabsContent>
             <TabsContent value="purchase-order" className="pt-4">
                <TemplateForm tags={availableTags.supplier} emailSubject="Purchase Order" emailBody="" smsBody="" whatsappText=""/>
            </TabsContent>
          </Tabs>
           <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="auto-email-supplier" />
                <Label htmlFor="auto-email-supplier" className="font-normal">Auto Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="auto-sms-supplier" />
                <Label htmlFor="auto-sms-supplier" className="font-normal">Auto Send SMS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="auto-whatsapp-supplier" />
                <Label htmlFor="auto-whatsapp-supplier" className="font-normal">Auto send Whatsapp notification</Label>
              </div>
            </div>
        </CardContent>
      </Card>
      
      {/* Sales Representative Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Representative Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="agent-commission" className="w-full">
            <TabsList className="flex-wrap h-auto justify-start">
              <TabsTrigger value="agent-commission">Agent Commission</TabsTrigger>
              <TabsTrigger value="subagent-commission">Sub-Agent Commission</TabsTrigger>
              <TabsTrigger value="company-commission">Company Commission</TabsTrigger>
            </TabsList>
            <TabsContent value="agent-commission" className="pt-4">
              <TemplateForm
                tags={availableTags.salesRepresentative}
                emailSubject="Your Agent Commission Statement from {business_name}"
                emailBody={`Dear {representative_name},\n\nYour commission as an Agent of {commission_amount} has been calculated for total sales of {total_sale_amount} during the period {reporting_period_start} to {reporting_period_end}.\n\nThank you,\n{business_name}`}
                smsBody="Thank you for your sales at {location_name}. Your commission of {commission_amount} on total sales of {total_sale_amount} has been calculated. For inquiries call {location_phone}."
                whatsappText="Dear {representative_name}, your Agent commission of {commission_amount} has been calculated. Thanks, {business_name}."
              />
            </TabsContent>
            <TabsContent value="subagent-commission" className="pt-4">
               <TemplateForm
                tags={availableTags.salesRepresentative}
                emailSubject="Your Sub-Agent Commission Statement from {business_name}"
                emailBody={`Dear {representative_name},\n\nYour commission as a Sub-Agent of {commission_amount} has been calculated for total sales of {total_sale_amount} during the period {reporting_period_start} to {reporting_period_end}.\n\nThank you,\n{business_name}`}
                smsBody="Thank you for your sales at {location_name}. Your Sub-Agent commission of {commission_amount} on total sales of {total_sale_amount} has been calculated. For inquiries call {location_phone}."
                whatsappText="Dear {representative_name}, your Sub-Agent commission of {commission_amount} has been calculated. Thanks, {business_name}."
              />
            </TabsContent>
            <TabsContent value="company-commission" className="pt-4">
               <TemplateForm
                tags={availableTags.salesRepresentative}
                emailSubject="Your Company Commission Statement from {business_name}"
                emailBody={`Dear {representative_name},\n\nYour Company commission of {commission_amount} has been calculated for total sales of {total_sale_amount} during the period {reporting_period_start} to {reporting_period_end}.\n\nThank you,\n{business_name}`}
                smsBody="Thank you for your sales at {location_name}. Your Company commission of {commission_amount} on total sales of {total_sale_amount} has been calculated. For inquiries call {location_phone}."
                whatsappText="Dear {representative_name}, your Company commission of {commission_amount} has been calculated. Thanks, {business_name}."
              />
            </TabsContent>
          </Tabs>
           <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="auto-email-representative" />
                <Label htmlFor="auto-email-representative" className="font-normal">Auto Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="auto-sms-representative" />
                <Label htmlFor="auto-sms-representative" className="font-normal">Auto Send SMS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="auto-whatsapp-representative" />
                <Label htmlFor="auto-whatsapp-representative" className="font-normal">Auto send Whatsapp notification</Label>
              </div>
            </div>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center gap-4">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 w-full flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm font-medium">Business logo will not work in SMS.</p>
        </div>
        <Button size="lg">Save</Button>
      </div>
      <AppFooter />
    </div>
  );
}
