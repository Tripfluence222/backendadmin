"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Tag, Users, Gift, Mail, TrendingUp, DollarSign, Percent } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { DrawerForm } from "@/components/forms/drawer-form";
import { marketingApi, Coupon, Affiliate, LoyaltyRule, EmailCampaign } from "@/lib/api/marketing";
import { createCouponSchema, updateCouponSchema, createAffiliateSchema, updateAffiliateSchema, createLoyaltyRuleSchema, updateLoyaltyRuleSchema, createEmailCampaignSchema, updateEmailCampaignSchema } from "@/lib/validation/marketing";
import { CouponColumns } from "./coupon-columns";
import { AffiliateColumns } from "./affiliate-columns";
import { LoyaltyColumns } from "./loyalty-columns";
import { EmailColumns } from "./email-columns";

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState("coupons");
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
  const [editingLoyaltyRule, setEditingLoyaltyRule] = useState<LoyaltyRule | null>(null);
  const [editingEmailCampaign, setEditingEmailCampaign] = useState<EmailCampaign | null>(null);

  const queryClient = useQueryClient();

  const { data: coupons = [] } = useQuery({
    queryKey: ["coupons"],
    queryFn: marketingApi.getCoupons,
  });

  const { data: affiliates = [] } = useQuery({
    queryKey: ["affiliates"],
    queryFn: marketingApi.getAffiliates,
  });

  const { data: loyaltyRules = [] } = useQuery({
    queryKey: ["loyalty-rules"],
    queryFn: marketingApi.getLoyaltyRules,
  });

  const { data: emailCampaigns = [] } = useQuery({
    queryKey: ["email-campaigns"],
    queryFn: marketingApi.getEmailCampaigns,
  });

  // Coupon mutations
  const createCouponMutation = useMutation({
    mutationFn: marketingApi.createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Coupon created successfully");
    },
    onError: () => {
      toast.error("Failed to create coupon");
    },
  });

  const updateCouponMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => marketingApi.updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Coupon updated successfully");
      setEditingCoupon(null);
    },
    onError: () => {
      toast.error("Failed to update coupon");
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: marketingApi.deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Coupon deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete coupon");
    },
  });

  // Affiliate mutations
  const createAffiliateMutation = useMutation({
    mutationFn: marketingApi.createAffiliate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliates"] });
      toast.success("Affiliate created successfully");
    },
    onError: () => {
      toast.error("Failed to create affiliate");
    },
  });

  const updateAffiliateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => marketingApi.updateAffiliate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliates"] });
      toast.success("Affiliate updated successfully");
      setEditingAffiliate(null);
    },
    onError: () => {
      toast.error("Failed to update affiliate");
    },
  });

  const deleteAffiliateMutation = useMutation({
    mutationFn: marketingApi.deleteAffiliate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliates"] });
      toast.success("Affiliate deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete affiliate");
    },
  });

  // Loyalty rule mutations
  const createLoyaltyMutation = useMutation({
    mutationFn: marketingApi.createLoyaltyRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-rules"] });
      toast.success("Loyalty rule created successfully");
    },
    onError: () => {
      toast.error("Failed to create loyalty rule");
    },
  });

  const updateLoyaltyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => marketingApi.updateLoyaltyRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-rules"] });
      toast.success("Loyalty rule updated successfully");
      setEditingLoyaltyRule(null);
    },
    onError: () => {
      toast.error("Failed to update loyalty rule");
    },
  });

  const deleteLoyaltyMutation = useMutation({
    mutationFn: marketingApi.deleteLoyaltyRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-rules"] });
      toast.success("Loyalty rule deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete loyalty rule");
    },
  });

  // Email campaign mutations
  const createEmailMutation = useMutation({
    mutationFn: marketingApi.createEmailCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
      toast.success("Email campaign created successfully");
    },
    onError: () => {
      toast.error("Failed to create email campaign");
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => marketingApi.updateEmailCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
      toast.success("Email campaign updated successfully");
      setEditingEmailCampaign(null);
    },
    onError: () => {
      toast.error("Failed to update email campaign");
    },
  });

  const deleteEmailMutation = useMutation({
    mutationFn: marketingApi.deleteEmailCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
      toast.success("Email campaign deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete email campaign");
    },
  });

  const handleCreateCoupon = (data: any) => {
    createCouponMutation.mutate(data);
  };

  const handleUpdateCoupon = (data: any) => {
    if (editingCoupon) {
      updateCouponMutation.mutate({ id: editingCoupon.id, data });
    }
  };

  const handleDeleteCoupon = (id: string) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      deleteCouponMutation.mutate(id);
    }
  };

  const handleCreateAffiliate = (data: any) => {
    createAffiliateMutation.mutate(data);
  };

  const handleUpdateAffiliate = (data: any) => {
    if (editingAffiliate) {
      updateAffiliateMutation.mutate({ id: editingAffiliate.id, data });
    }
  };

  const handleDeleteAffiliate = (id: string) => {
    if (confirm("Are you sure you want to delete this affiliate?")) {
      deleteAffiliateMutation.mutate(id);
    }
  };

  const handleCreateLoyaltyRule = (data: any) => {
    createLoyaltyMutation.mutate(data);
  };

  const handleUpdateLoyaltyRule = (data: any) => {
    if (editingLoyaltyRule) {
      updateLoyaltyMutation.mutate({ id: editingLoyaltyRule.id, data });
    }
  };

  const handleDeleteLoyaltyRule = (id: string) => {
    if (confirm("Are you sure you want to delete this loyalty rule?")) {
      deleteLoyaltyMutation.mutate(id);
    }
  };

  const handleCreateEmailCampaign = (data: any) => {
    createEmailMutation.mutate(data);
  };

  const handleUpdateEmailCampaign = (data: any) => {
    if (editingEmailCampaign) {
      updateEmailMutation.mutate({ id: editingEmailCampaign.id, data });
    }
  };

  const handleDeleteEmailCampaign = (id: string) => {
    if (confirm("Are you sure you want to delete this email campaign?")) {
      deleteEmailMutation.mutate(id);
    }
  };

  // Calculate metrics
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.isActive).length;
  const totalAffiliates = affiliates.length;
  const totalCommissions = affiliates.reduce((sum, a) => sum + a.totalCommissions, 0);
  const totalLoyaltyRules = loyaltyRules.length;
  const activeLoyaltyRules = loyaltyRules.filter(r => r.isActive).length;
  const totalEmailCampaigns = emailCampaigns.length;
  const sentCampaigns = emailCampaigns.filter(c => c.status === "sent").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing Tools</h1>
          <p className="text-muted-foreground">
            Manage coupons, affiliates, loyalty programs, and email campaigns
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCoupons}</div>
            <p className="text-xs text-muted-foreground">
              {totalCoupons} total coupons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Affiliates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAffiliates}</div>
            <p className="text-xs text-muted-foreground">
              ${totalCommissions.toLocaleString()} paid out
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Rules</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoyaltyRules}</div>
            <p className="text-xs text-muted-foreground">
              {totalLoyaltyRules} total rules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {totalEmailCampaigns} total campaigns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        <TabsContent value="coupons" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Coupons & Promo Codes</h2>
            <Button onClick={() => setEditingCoupon({} as Coupon)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Coupon
            </Button>
          </div>
          <DataTable
            columns={CouponColumns({
              onEdit: setEditingCoupon,
              onDelete: handleDeleteCoupon,
            })}
            data={coupons}
            searchKey="code"
            searchPlaceholder="Search coupons..."
          />
        </TabsContent>

        <TabsContent value="affiliates" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Affiliates & Referrals</h2>
            <Button onClick={() => setEditingAffiliate({} as Affiliate)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Affiliate
            </Button>
          </div>
          <DataTable
            columns={AffiliateColumns({
              onEdit: setEditingAffiliate,
              onDelete: handleDeleteAffiliate,
            })}
            data={affiliates}
            searchKey="name"
            searchPlaceholder="Search affiliates..."
          />
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Loyalty Program</h2>
            <Button onClick={() => setEditingLoyaltyRule({} as LoyaltyRule)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Rule
            </Button>
          </div>
          <DataTable
            columns={LoyaltyColumns({
              onEdit: setEditingLoyaltyRule,
              onDelete: handleDeleteLoyaltyRule,
            })}
            data={loyaltyRules}
            searchKey="name"
            searchPlaceholder="Search loyalty rules..."
          />
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Email Campaigns</h2>
            <Button onClick={() => setEditingEmailCampaign({} as EmailCampaign)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </div>
          <DataTable
            columns={EmailColumns({
              onEdit: setEditingEmailCampaign,
              onDelete: handleDeleteEmailCampaign,
            })}
            data={emailCampaigns}
            searchKey="name"
            searchPlaceholder="Search campaigns..."
          />
        </TabsContent>
      </Tabs>

      {/* Coupon Form */}
      {editingCoupon && (
        <DrawerForm
          isOpen={!!editingCoupon}
          onClose={() => setEditingCoupon(null)}
          title={editingCoupon.id ? "Edit Coupon" : "Create Coupon"}
          description="Manage coupon settings and restrictions"
          schema={editingCoupon.id ? updateCouponSchema : createCouponSchema}
          defaultValues={editingCoupon.id ? editingCoupon : undefined}
          onSubmit={editingCoupon.id ? handleUpdateCoupon : handleCreateCoupon}
          isLoading={editingCoupon.id ? updateCouponMutation.isPending : createCouponMutation.isPending}
        >
          {(form) => (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Coupon Code</label>
                  <Input {...form.register("code")} placeholder="WELCOME20" />
                  {form.formState.errors.code && (
                    <p className="text-sm text-red-500">{form.formState.errors.code.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Coupon Name</label>
                  <Input {...form.register("name")} placeholder="Welcome Discount" />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  {...form.register("description")}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Coupon description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select onValueChange={(value) => form.setValue("type", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                      <SelectItem value="free_shipping">Free Shipping</SelectItem>
                      <SelectItem value="buy_one_get_one">Buy One Get One</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Value</label>
                  <Input 
                    {...form.register("value", { valueAsNumber: true })} 
                    type="number" 
                    placeholder="20"
                  />
                  {form.formState.errors.value && (
                    <p className="text-sm text-red-500">{form.formState.errors.value.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Valid From</label>
                  <Input 
                    {...form.register("validFrom", { valueAsDate: true })} 
                    type="date"
                  />
                  {form.formState.errors.validFrom && (
                    <p className="text-sm text-red-500">{form.formState.errors.validFrom.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Valid Until</label>
                  <Input 
                    {...form.register("validUntil", { valueAsDate: true })} 
                    type="date"
                  />
                  {form.formState.errors.validUntil && (
                    <p className="text-sm text-red-500">{form.formState.errors.validUntil.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Usage Limit (Optional)</label>
                  <Input 
                    {...form.register("usageLimit", { valueAsNumber: true })} 
                    type="number" 
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Per Customer Limit (Optional)</label>
                  <Input 
                    {...form.register("usageLimitPerCustomer", { valueAsNumber: true })} 
                    type="number" 
                    placeholder="1"
                  />
                </div>
              </div>
            </div>
          )}
        </DrawerForm>
      )}

      {/* Affiliate Form */}
      {editingAffiliate && (
        <DrawerForm
          isOpen={!!editingAffiliate}
          onClose={() => setEditingAffiliate(null)}
          title={editingAffiliate.id ? "Edit Affiliate" : "Add Affiliate"}
          description="Manage affiliate settings and commission rates"
          schema={editingAffiliate.id ? updateAffiliateSchema : createAffiliateSchema}
          defaultValues={editingAffiliate.id ? editingAffiliate : undefined}
          onSubmit={editingAffiliate.id ? handleUpdateAffiliate : handleCreateAffiliate}
          isLoading={editingAffiliate.id ? updateAffiliateMutation.isPending : createAffiliateMutation.isPending}
        >
          {(form) => (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input {...form.register("name")} placeholder="Affiliate Name" />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input {...form.register("email")} type="email" placeholder="affiliate@email.com" />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Phone (Optional)</label>
                <Input {...form.register("phone")} placeholder="+1-555-0123" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Commission Rate (%)</label>
                  <Input 
                    {...form.register("commissionRate", { valueAsNumber: true })} 
                    type="number" 
                    min="0"
                    max="100"
                    placeholder="15"
                  />
                  {form.formState.errors.commissionRate && (
                    <p className="text-sm text-red-500">{form.formState.errors.commissionRate.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Method</label>
                  <Select onValueChange={(value) => form.setValue("paymentMethod", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Payment Details</label>
                <Input {...form.register("paymentDetails")} placeholder="Payment details..." />
              </div>
            </div>
          )}
        </DrawerForm>
      )}

      {/* Loyalty Rule Form */}
      {editingLoyaltyRule && (
        <DrawerForm
          isOpen={!!editingLoyaltyRule}
          onClose={() => setEditingLoyaltyRule(null)}
          title={editingLoyaltyRule.id ? "Edit Loyalty Rule" : "Create Loyalty Rule"}
          description="Define loyalty program rules and rewards"
          schema={editingLoyaltyRule.id ? updateLoyaltyRuleSchema : createLoyaltyRuleSchema}
          defaultValues={editingLoyaltyRule.id ? editingLoyaltyRule : undefined}
          onSubmit={editingLoyaltyRule.id ? handleUpdateLoyaltyRule : handleCreateLoyaltyRule}
          isLoading={editingLoyaltyRule.id ? updateLoyaltyMutation.isPending : createLoyaltyMutation.isPending}
        >
          {(form) => (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Rule Name</label>
                <Input {...form.register("name")} placeholder="First Booking Bonus" />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  {...form.register("description")}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Rule description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Trigger Type</label>
                  <Select onValueChange={(value) => form.setValue("triggerType", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booking">Booking</SelectItem>
                      <SelectItem value="spend">Spend Amount</SelectItem>
                      <SelectItem value="frequency">Frequency</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Trigger Value</label>
                  <Input 
                    {...form.register("triggerValue", { valueAsNumber: true })} 
                    type="number" 
                    placeholder="1"
                  />
                  {form.formState.errors.triggerValue && (
                    <p className="text-sm text-red-500">{form.formState.errors.triggerValue.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Reward Type</label>
                  <Select onValueChange={(value) => form.setValue("rewardType", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reward" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="points">Points</SelectItem>
                      <SelectItem value="discount">Discount</SelectItem>
                      <SelectItem value="free_item">Free Item</SelectItem>
                      <SelectItem value="upgrade">Upgrade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Reward Value</label>
                  <Input 
                    {...form.register("rewardValue", { valueAsNumber: true })} 
                    type="number" 
                    placeholder="100"
                  />
                  {form.formState.errors.rewardValue && (
                    <p className="text-sm text-red-500">{form.formState.errors.rewardValue.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DrawerForm>
      )}

      {/* Email Campaign Form */}
      {editingEmailCampaign && (
        <DrawerForm
          isOpen={!!editingEmailCampaign}
          onClose={() => setEditingEmailCampaign(null)}
          title={editingEmailCampaign.id ? "Edit Email Campaign" : "Create Email Campaign"}
          description="Create and manage email marketing campaigns"
          schema={editingEmailCampaign.id ? updateEmailCampaignSchema : createEmailCampaignSchema}
          defaultValues={editingEmailCampaign.id ? editingEmailCampaign : undefined}
          onSubmit={editingEmailCampaign.id ? handleUpdateEmailCampaign : handleCreateEmailCampaign}
          isLoading={editingEmailCampaign.id ? updateEmailMutation.isPending : createEmailMutation.isPending}
        >
          {(form) => (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Campaign Name</label>
                <Input {...form.register("name")} placeholder="Welcome Series" />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Subject Line</label>
                <Input {...form.register("subject")} placeholder="Welcome to Tripfluence!" />
                {form.formState.errors.subject && (
                  <p className="text-sm text-red-500">{form.formState.errors.subject.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Email Content</label>
                <textarea
                  {...form.register("content")}
                  className="w-full p-2 border rounded-md"
                  rows={8}
                  placeholder="Write your email content here..."
                />
                {form.formState.errors.content && (
                  <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Recipient Type</label>
                <Select onValueChange={(value) => form.setValue("recipientType", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="segment">Customer Segment</SelectItem>
                    <SelectItem value="list">Custom List</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Schedule Date (Optional)</label>
                <Input 
                  {...form.register("scheduledAt", { valueAsDate: true })} 
                  type="datetime-local"
                />
              </div>
            </div>
          )}
        </DrawerForm>
      )}
    </div>
  );
}
