"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Filter, Download, User, Mail, Phone, Star, Calendar, DollarSign } from "lucide-react";
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
import { DataTable } from "@/components/ui/data-table";
import { DrawerForm } from "@/components/forms/drawer-form";
import { customersApi, Customer } from "@/lib/api/customers";
import { createCustomerSchema, updateCustomerSchema, addCustomerNoteSchema, updateCustomerPreferencesSchema } from "@/lib/validation/customers";
import { columns } from "./columns";
import { CustomerProfileModal } from "./customer-profile-modal";

export default function CustomersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    tags: "",
  });

  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: customersApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer created successfully");
      setIsCreateOpen(false);
    },
    onError: () => {
      toast.error("Failed to create customer");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => customersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer updated successfully");
      setEditingCustomer(null);
    },
    onError: () => {
      toast.error("Failed to update customer");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: customersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete customer");
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => customersApi.addNote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Note added successfully");
    },
    onError: () => {
      toast.error("Failed to add note");
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => customersApi.updatePreferences(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Preferences updated successfully");
    },
    onError: () => {
      toast.error("Failed to update preferences");
    },
  });

  const exportMutation = useMutation({
    mutationFn: customersApi.exportSegment,
    onSuccess: (csvData) => {
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'customers.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Customer data exported successfully");
    },
    onError: () => {
      toast.error("Failed to export customer data");
    },
  });

  // Filter customers based on current filters
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      customer.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
      customer.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.status || customer.status === filters.status;
    const matchesTags = !filters.tags || customer.tags.some(tag => 
      tag.toLowerCase().includes(filters.tags.toLowerCase())
    );
    
    return matchesSearch && matchesStatus && matchesTags;
  });

  const handleCreate = (data: any) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: any) => {
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleAddNote = (customerId: string, data: any) => {
    addNoteMutation.mutate({ id: customerId, data });
  };

  const handleUpdatePreferences = (customerId: string, data: any) => {
    updatePreferencesMutation.mutate({ id: customerId, data });
  };

  const handleExport = () => {
    exportMutation.mutate(filters);
  };

  const tableColumns = columns({
    onView: handleViewCustomer,
    onEdit: setEditingCustomer,
    onDelete: handleDelete,
  });

  // Get all unique tags
  const allTags = Array.from(new Set(customers.flatMap(c => c.tags)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers & CRM</h1>
          <p className="text-muted-foreground">
            Manage your customer relationships and data
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={exportMutation.isPending}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Input
          placeholder="Search customers..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-64"
        />
        
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.tags}
          onValueChange={(value) => setFilters(prev => ({ ...prev, tags: value }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {allTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilters({ search: "", status: "", tags: "" })}
        >
          Clear Filters
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((customers.filter(c => c.status === "active").length / customers.length) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Customers</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.status === "vip").length}
            </div>
            <p className="text-xs text-muted-foreground">
              High-value customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From all customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        columns={tableColumns}
        data={filteredCustomers}
        searchKey="firstName"
        searchPlaceholder="Search customers..."
      />

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <CustomerProfileModal
          customer={selectedCustomer}
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onAddNote={handleAddNote}
          onUpdatePreferences={handleUpdatePreferences}
        />
      )}

      {/* Create Customer Form */}
      <DrawerForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Customer"
        description="Create a new customer profile"
        schema={createCustomerSchema}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input {...form.register("email")} type="email" placeholder="john@example.com" />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Phone (Optional)</label>
                <Input {...form.register("phone")} placeholder="+1-555-0123" />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Date of Birth (Optional)</label>
              <Input {...form.register("dateOfBirth", { valueAsDate: true })} type="date" />
              {form.formState.errors.dateOfBirth && (
                <p className="text-sm text-red-500">{form.formState.errors.dateOfBirth.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select onValueChange={(value) => form.setValue("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Tags (Optional)</label>
              <Input 
                {...form.register("tags")} 
                placeholder="Enter tags separated by commas (e.g., VIP, Foodie, Regular)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate multiple tags with commas
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Notes (Optional)</label>
              <textarea
                {...form.register("notes")}
                className="w-full p-2 border rounded-md"
                rows={3}
                placeholder="Additional notes about the customer..."
              />
            </div>
          </div>
        )}
      </DrawerForm>

      {/* Edit Customer Form */}
      {editingCustomer && (
        <DrawerForm
          isOpen={!!editingCustomer}
          onClose={() => setEditingCustomer(null)}
          title="Edit Customer"
          description="Update customer information"
          schema={updateCustomerSchema}
          defaultValues={{
            ...editingCustomer,
            dateOfBirth: editingCustomer.dateOfBirth ? new Date(editingCustomer.dateOfBirth) : undefined,
          }}
          onSubmit={handleUpdate}
          isLoading={updateMutation.isPending}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input {...form.register("email")} type="email" placeholder="john@example.com" />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Phone (Optional)</label>
                  <Input {...form.register("phone")} placeholder="+1-555-0123" />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Date of Birth (Optional)</label>
                <Input {...form.register("dateOfBirth", { valueAsDate: true })} type="date" />
                {form.formState.errors.dateOfBirth && (
                  <p className="text-sm text-red-500">{form.formState.errors.dateOfBirth.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <Select onValueChange={(value) => form.setValue("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.status && (
                  <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Tags (Optional)</label>
                <Input 
                  {...form.register("tags")} 
                  placeholder="Enter tags separated by commas (e.g., VIP, Foodie, Regular)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate multiple tags with commas
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Notes (Optional)</label>
                <textarea
                  {...form.register("notes")}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Additional notes about the customer..."
                />
              </div>
            </div>
          )}
        </DrawerForm>
      )}
    </div>
  );
}
