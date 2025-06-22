import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Info } from "lucide-react";

export default function AddUserPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold">Add user</h1>
            <div className="flex flex-col gap-6">
                
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="prefix">Prefix:</Label>
                                <Input id="prefix" placeholder="Mr / Mrs / Miss" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="first-name">First Name:*</Label>
                                <Input id="first-name" placeholder="First Name" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last-name">Last Name:</Label>
                                <Input id="last-name" placeholder="Last Name" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email:*</Label>
                                <Input id="email" type="email" placeholder="Email" />
                            </div>
                        </div>
                        <div className="flex items-center gap-8 mt-6">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="is-active" defaultChecked />
                                <Label htmlFor="is-active" className="flex items-center gap-1 font-normal">Is active? <Info className="w-4 h-4 text-muted-foreground" /></Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="enable-pin" />
                                <Label htmlFor="enable-pin" className="flex items-center gap-1 font-normal">Enable service staff pin <Info className="w-4 h-4 text-muted-foreground" /></Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Roles and Permissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2 mb-6">
                            <Checkbox id="allow-login" defaultChecked />
                            <Label htmlFor="allow-login" className="font-normal">Allow login</Label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username:</Label>
                                <Input id="username" placeholder="Username" />
                                <p className="text-xs text-muted-foreground">Leave blank to auto generate username</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password:*</Label>
                                <Input id="password" type="password" placeholder="Password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm Password:*</Label>
                                <Input id="confirm-password" type="password" placeholder="Confirm Password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role:*</Label>
                                <Select>
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="cashier">Cashier</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="mt-6 space-y-2">
                            <Label className="flex items-center gap-1">Access locations <Info className="w-4 h-4 text-muted-foreground" /></Label>
                             <div className="flex items-center space-x-2">
                                <Checkbox id="all-locations" defaultChecked />
                                <Label htmlFor="all-locations" className="font-normal">All Locations</Label>
                            </div>
                             <div className="flex items-center space-x-2 ml-4">
                                <Checkbox id="awesome-shop" defaultChecked />
                                <Label htmlFor="awesome-shop" className="font-normal">Awesome Shop</Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="commission-percentage" className="flex items-center gap-1">Sales Commission Percentage (%): <Info className="w-4 h-4 text-muted-foreground" /></Label>
                                <Input id="commission-percentage" placeholder="Sales Commission Percentage (%)" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="max-discount" className="flex items-center gap-1">Max sales discount percent: <Info className="w-4 h-4 text-muted-foreground" /></Label>
                                <Input id="max-discount" placeholder="Max sales discount percent" />
                            </div>
                         </div>
                         <div className="flex items-center space-x-2 mt-6">
                            <Checkbox id="allow-contacts" />
                            <Label htmlFor="allow-contacts" className="font-normal">Allow Selected Contacts</Label>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">More Informations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="dob">Date of birth:</Label>
                                <Input id="dob" type="date" placeholder="Date of birth" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="gender">Gender:</Label>
                                <Select>
                                    <SelectTrigger id="gender">
                                        <SelectValue placeholder="Please Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="marital-status">Marital Status:</Label>
                                <Select>
                                    <SelectTrigger id="marital-status">
                                        <SelectValue placeholder="Marital Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="single">Single</SelectItem>
                                        <SelectItem value="married">Married</SelectItem>
                                        <SelectItem value="divorced">Divorced</SelectItem>
                                        <SelectItem value="widowed">Widowed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="blood-group">Blood Group:</Label>
                                <Input id="blood-group" placeholder="Blood Group" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mobile">Mobile Number:</Label>
                                <Input id="mobile" placeholder="Mobile Number" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="alt-mobile">Alternate contact number:</Label>
                                <Input id="alt-mobile" placeholder="Alternate contact number" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="family-mobile">Family contact number:</Label>
                                <Input id="family-mobile" placeholder="Family contact number" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="facebook">Facebook Link:</Label>
                                <Input id="facebook" placeholder="Facebook Link" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="twitter">Twitter Link:</Label>
                                <Input id="twitter" placeholder="Twitter Link" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="social1">Social Media 1:</Label>
                                <Input id="social1" placeholder="Social Media 1" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="social2">Social Media 2:</Label>
                                <Input id="social2" placeholder="Social Media 2" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                            <div className="space-y-2">
                                <Label htmlFor="custom1">Custom field 1:</Label>
                                <Input id="custom1" placeholder="Custom field 1" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="custom2">Custom field 2:</Label>
                                <Input id="custom2" placeholder="Custom field 2" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="custom3">Custom field 3:</Label>
                                <Input id="custom3" placeholder="Custom field 3" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="custom4">Custom field 4:</Label>
                                <Input id="custom4" placeholder="Custom field 4" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="guardian">Guardian Name:</Label>
                                <Input id="guardian" placeholder="Guardian Name" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="id-proof">ID proof name:</Label>
                                <Input id="id-proof" placeholder="ID proof name" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="id-proof-number">ID proof number:</Label>
                                <Input id="id-proof-number" placeholder="ID proof number" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                           <div className="space-y-2">
                                <Label htmlFor="permanent-address">Permanent Address:</Label>
                                <Textarea id="permanent-address" placeholder="Permanent Address" />
                           </div>
                            <div className="space-y-2">
                                <Label htmlFor="current-address">Current Address:</Label>
                                <Textarea id="current-address" placeholder="Current Address" />
                           </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Bank Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                           <div className="space-y-2">
                                <Label htmlFor="account-holder">Account Holder's Name:</Label>
                                <Input id="account-holder" placeholder="Account Holder's Name" />
                           </div>
                           <div className="space-y-2">
                                <Label htmlFor="account-number">Account Number:</Label>
                                <Input id="account-number" placeholder="Account Number" />
                           </div>
                           <div className="space-y-2">
                                <Label htmlFor="bank-name">Bank Name:</Label>
                                <Input id="bank-name" placeholder="Bank Name" />
                           </div>
                           <div className="space-y-2">
                                <Label htmlFor="bank-code" className="flex items-center gap-1">Bank Identifier Code: <Info className="w-4 h-4 text-muted-foreground" /></Label>
                                <Input id="bank-code" placeholder="Bank Identifier Code" />
                           </div>
                           <div className="space-y-2">
                                <Label htmlFor="branch">Branch:</Label>
                                <Input id="branch" placeholder="Branch" />
                           </div>
                           <div className="space-y-2">
                                <Label htmlFor="tax-payer-id" className="flex items-center gap-1">Tax Payer ID: <Info className="w-4 h-4 text-muted-foreground" /></Label>
                                <Input id="tax-payer-id" placeholder="Tax Payer ID" />
                           </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">HRM Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                                <Label htmlFor="department">Department:</Label>
                                <Select>
                                    <SelectTrigger id="department">
                                        <SelectValue placeholder="Please Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sales">Sales</SelectItem>
                                        <SelectItem value="hr">Human Resources</SelectItem>
                                        <SelectItem value="it">IT</SelectItem>
                                    </SelectContent>
                                </Select>
                           </div>
                           <div className="space-y-2">
                                <Label htmlFor="designation">Designation:</Label>
                                 <Select>
                                    <SelectTrigger id="designation">
                                        <SelectValue placeholder="Please Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="developer">Developer</SelectItem>
                                        <SelectItem value="clerk">Clerk</SelectItem>
                                    </SelectContent>
                                </Select>
                           </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Payroll</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="space-y-2">
                                <Label htmlFor="work-location">Primary work location:</Label>
                                <Select>
                                    <SelectTrigger id="work-location">
                                        <SelectValue placeholder="Please Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="main-office">Main Office</SelectItem>
                                        <SelectItem value="warehouse">Warehouse</SelectItem>
                                    </SelectContent>
                                </Select>
                           </div>
                           <div className="space-y-2">
                                <Label htmlFor="salary">Basic salary:</Label>
                                <div className="flex gap-2">
                                    <Input id="salary" placeholder="Basic salary" />
                                    <Select defaultValue="month">
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="month">Per Month</SelectItem>
                                            <SelectItem value="year">Per Year</SelectItem>
                                            <SelectItem value="hour">Per Hour</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                           </div>
                           <div className="space-y-2">
                                <Label htmlFor="pay-components">Pay Components:</Label>
                                <Input id="pay-components" placeholder="Pay Components" />
                           </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button size="lg">Save</Button>
                </div>
            </div>
        </div>
    );
}
