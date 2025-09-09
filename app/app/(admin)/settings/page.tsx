"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Users, CreditCard, Palette, Webhook, Key, Shield, Settings as SettingsIcon } from "lucide-react";
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
import { settingsApi, User } from "@/lib/api/settings";
import type { Webhook, ApiKey } from "@/lib/api/settings";
import { updateBrandingSchema, updatePaymentSettingsSchema, createUserSchema, updateUserSchema, createWebhookSchema, updateWebhookSchema, createApiKeySchema } from "@/lib/validation/settings";
import { UserColumns } from "./user-columns";
import { WebhookColumns } from "./webhook-columns";
import { ApiKeyColumns } from "./api-key-columns";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("branding");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [editingApiKey, setEditingApiKey] = useState<ApiKey | null>(null);

  const queryClient = useQueryClient();

  const { data: brandingSettings } = useQuery({
    queryKey: ["branding-settings"],
    queryFn: settingsApi.getBrandingSettings,
  });

  const { data: paymentSettings } = useQuery({
    queryKey: ["payment-settings"],
    queryFn: settingsApi.getPaymentSettings,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: settingsApi.getUsers,
  });

  const { data: webhooks = [] } = useQuery({
    queryKey: ["webhooks"],
    queryFn: settingsApi.getWebhooks,
  });

  const { data: apiKeys = [] } = useQuery({
    queryKey: ["api-keys"],
    queryFn: settingsApi.getApiKeys,
  });

  // Mutations
  const updateBrandingMutation = useMutation({
    mutationFn: settingsApi.updateBrandingSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branding-settings"] });
      toast.success("Branding settings updated successfully");
    },
    onError: () => {
      toast.error("Failed to update branding settings");
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: settingsApi.updatePaymentSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-settings"] });
      toast.success("Payment settings updated successfully");
    },
    onError: () => {
      toast.error("Failed to update payment settings");
    },
  });

  const createUserMutation = useMutation({
    mutationFn: settingsApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
      setEditingUser(null);
    },
    onError: () => {
      toast.error("Failed to create user");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => settingsApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
      setEditingUser(null);
    },
    onError: () => {
      toast.error("Failed to update user");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: settingsApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete user");
    },
  });

  const createWebhookMutation = useMutation({
    mutationFn: settingsApi.createWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Webhook created successfully");
      setEditingWebhook(null);
    },
    onError: () => {
      toast.error("Failed to create webhook");
    },
  });

  const updateWebhookMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => settingsApi.updateWebhook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Webhook updated successfully");
      setEditingWebhook(null);
    },
    onError: () => {
      toast.error("Failed to update webhook");
    },
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: settingsApi.deleteWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Webhook deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete webhook");
    },
  });

  const createApiKeyMutation = useMutation({
    mutationFn: settingsApi.createApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key created successfully");
      setEditingApiKey(null);
    },
    onError: () => {
      toast.error("Failed to create API key");
    },
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: settingsApi.deleteApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete API key");
    },
  });

  const toggleApiKeyMutation = useMutation({
    mutationFn: settingsApi.toggleApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key status updated");
    },
    onError: () => {
      toast.error("Failed to update API key");
    },
  });

  const testWebhookMutation = useMutation({
    mutationFn: settingsApi.testWebhook,
    onSuccess: (success) => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success(success ? "Webhook test successful" : "Webhook test failed");
    },
    onError: () => {
      toast.error("Failed to test webhook");
    },
  });

  const handleUpdateBranding = (data: any) => {
    updateBrandingMutation.mutate(data);
  };

  const handleUpdatePayment = (data: any) => {
    updatePaymentMutation.mutate(data);
  };

  const handleCreateUser = (data: any) => {
    createUserMutation.mutate(data);
  };

  const handleUpdateUser = (data: any) => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data });
    }
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(id);
    }
  };

  const handleCreateWebhook = (data: any) => {
    createWebhookMutation.mutate(data);
  };

  const handleUpdateWebhook = (data: any) => {
    if (editingWebhook) {
      updateWebhookMutation.mutate({ id: editingWebhook.id, data });
    }
  };

  const handleDeleteWebhook = (id: string) => {
    if (confirm("Are you sure you want to delete this webhook?")) {
      deleteWebhookMutation.mutate(id);
    }
  };

  const handleTestWebhook = (id: string) => {
    testWebhookMutation.mutate(id);
  };

  const handleCreateApiKey = (data: any) => {
    createApiKeyMutation.mutate(data);
  };

  const handleDeleteApiKey = (id: string) => {
    if (confirm("Are you sure you want to delete this API key?")) {
      deleteApiKeyMutation.mutate(id);
    }
  };

  const handleToggleApiKey = (id: string) => {
    toggleApiKeyMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your platform configuration and user access
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Branding Settings
              </CardTitle>
              <CardDescription>
                Customize your platform's appearance and branding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DrawerForm
                isOpen={true}
                onClose={() => {}}
                title="Branding Settings"
                description="Update your platform's visual identity"
                schema={updateBrandingSchema}
                defaultValues={brandingSettings}
                onSubmit={handleUpdateBranding}
                isLoading={updateBrandingMutation.isPending}
                showCloseButton={false}
              >
                {(form) => (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Logo URL</label>
                      <Input {...form.register("logo")} placeholder="https://example.com/logo.png" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Primary Color</label>
                        <Input {...form.register("primaryColor")} type="color" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Secondary Color</label>
                        <Input {...form.register("secondaryColor")} type="color" />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Font Family</label>
                      <Select onValueChange={(value) => form.setValue("fontFamily", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select font" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                          <SelectItem value="Arial">Arial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Custom CSS</label>
                      <textarea
                        {...form.register("customCSS")}
                        className="w-full p-2 border rounded-md"
                        rows={6}
                        placeholder="/* Custom CSS styles */"
                      />
                    </div>
                  </div>
                )}
              </DrawerForm>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Settings
              </CardTitle>
              <CardDescription>
                Configure payment gateways and processing settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DrawerForm
                isOpen={true}
                onClose={() => {}}
                title="Payment Settings"
                description="Configure your payment processing"
                schema={updatePaymentSettingsSchema}
                defaultValues={paymentSettings}
                onSubmit={handleUpdatePayment}
                isLoading={updatePaymentMutation.isPending}
                showCloseButton={false}
              >
                {(form) => (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Default Currency</label>
                      <Select onValueChange={(value) => form.setValue("defaultCurrency", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="INR">INR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Tax Rate (%)</label>
                      <Input 
                        {...form.register("taxRate", { valueAsNumber: true })} 
                        type="number" 
                        min="0" 
                        max="100" 
                        step="0.1"
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Stripe Settings</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Public Key</label>
                          <Input {...form.register("stripePublicKey")} placeholder="pk_live_..." />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Secret Key</label>
                          <Input {...form.register("stripeSecretKey")} type="password" placeholder="sk_live_..." />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">PayPal Settings</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Client ID</label>
                          <Input {...form.register("paypalClientId")} placeholder="PayPal Client ID" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Client Secret</label>
                          <Input {...form.register("paypalClientSecret")} type="password" placeholder="PayPal Client Secret" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </DrawerForm>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">User Management</h2>
            <Button onClick={() => setEditingUser({} as User)}>
              <Users className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
          <DataTable
            columns={UserColumns({
              onEdit: setEditingUser,
              onDelete: handleDeleteUser,
            })}
            data={users}
            searchKey="firstName"
            searchPlaceholder="Search users..."
          />
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Webhook Management</h2>
            <Button onClick={() => setEditingWebhook({} as Webhook)}>
              <Webhook className="mr-2 h-4 w-4" />
              Add Webhook
            </Button>
          </div>
          <DataTable
            columns={WebhookColumns({
              onEdit: setEditingWebhook,
              onDelete: handleDeleteWebhook,
              onTest: handleTestWebhook,
            })}
            data={webhooks}
            searchKey="name"
            searchPlaceholder="Search webhooks..."
          />
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">API Key Management</h2>
            <Button onClick={() => setEditingApiKey({} as ApiKey)}>
              <Key className="mr-2 h-4 w-4" />
              Generate API Key
            </Button>
          </div>
          <DataTable
            columns={ApiKeyColumns({
              onDelete: handleDeleteApiKey,
              onToggle: handleToggleApiKey,
            })}
            data={apiKeys}
            searchKey="name"
            searchPlaceholder="Search API keys..."
          />
        </TabsContent>
      </Tabs>

      {/* User Form */}
      {editingUser && (
        <DrawerForm
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title={editingUser.id ? "Edit User" : "Add User"}
          description="Manage user access and permissions"
          schema={editingUser.id ? updateUserSchema : createUserSchema}
          defaultValues={editingUser.id ? editingUser : undefined}
          onSubmit={editingUser.id ? handleUpdateUser : handleCreateUser}
          isLoading={editingUser.id ? updateUserMutation.isPending : createUserMutation.isPending}
        >
          {(form) => (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Input {...form.register("firstName")} placeholder="John" />
                  {form.formState.errors.firstName && (
                    <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input {...form.register("lastName")} placeholder="Doe" />
                  {form.formState.errors.lastName && (
                    <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input {...form.register("email")} type="email" placeholder="john@example.com" />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Role</label>
                <Select onValueChange={(value) => form.setValue("role", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="influencer">Influencer</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.role && (
                  <p className="text-sm text-red-500">{form.formState.errors.role.message}</p>
                )}
              </div>
            </div>
          )}
        </DrawerForm>
      )}

      {/* Webhook Form */}
      {editingWebhook && (
        <DrawerForm
          isOpen={!!editingWebhook}
          onClose={() => setEditingWebhook(null)}
          title={editingWebhook.id ? "Edit Webhook" : "Add Webhook"}
          description="Configure webhook endpoints for real-time notifications"
          schema={editingWebhook.id ? updateWebhookSchema : createWebhookSchema}
          defaultValues={editingWebhook.id ? editingWebhook : undefined}
          onSubmit={editingWebhook.id ? handleUpdateWebhook : handleCreateWebhook}
          isLoading={editingWebhook.id ? updateWebhookMutation.isPending : createWebhookMutation.isPending}
        >
          {(form) => (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Webhook Name</label>
                <Input {...form.register("name")} placeholder="Order Created Webhook" />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Webhook URL</label>
                <Input {...form.register("url")} placeholder="https://api.example.com/webhooks/order-created" />
                {form.formState.errors.url && (
                  <p className="text-sm text-red-500">{form.formState.errors.url.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Events</label>
                <div className="space-y-2">
                  {["order.created", "order.updated", "customer.created", "booking.created"].map((event) => (
                    <label key={event} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={event}
                        {...form.register("events")}
                        className="rounded"
                      />
                      <span className="text-sm">{event}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Secret (Optional)</label>
                <Input {...form.register("secret")} type="password" placeholder="Webhook secret for verification" />
              </div>
            </div>
          )}
        </DrawerForm>
      )}

      {/* API Key Form */}
      {editingApiKey && (
        <DrawerForm
          isOpen={!!editingApiKey}
          onClose={() => setEditingApiKey(null)}
          title="Generate API Key"
          description="Create a new API key for external integrations"
          schema={createApiKeySchema}
          onSubmit={handleCreateApiKey}
          isLoading={createApiKeyMutation.isPending}
        >
          {(form) => (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">API Key Name</label>
                <Input {...form.register("name")} placeholder="Mobile App API" />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Permissions</label>
                <div className="space-y-2">
                  {["read:listings", "read:availability", "create:bookings", "read:reviews"].map((permission) => (
                    <label key={permission} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={permission}
                        {...form.register("permissions")}
                        className="rounded"
                      />
                      <span className="text-sm">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Expires At (Optional)</label>
                <Input {...form.register("expiresAt", { valueAsDate: true })} type="date" />
              </div>
            </div>
          )}
        </DrawerForm>
      )}
    </div>
  );
}
