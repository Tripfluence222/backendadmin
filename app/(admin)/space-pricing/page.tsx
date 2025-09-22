"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, DollarSign, Clock, Calendar, Filter } from "lucide-react";
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
import { spaceApi, Space, SpacePricingRule } from "@/lib/api/space";
import { SpacePricingRulesBulkSchema } from "@/lib/validation/space";
import { columns } from "./columns";
import { PricingForm } from "./pricing-form";

export default function SpacePricingPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    spaceId: "all",
    kind: "all",
  });

  const queryClient = useQueryClient();

  // Fetch spaces with pricing rules
  const { data: spacesData, isLoading } = useQuery({
    queryKey: ["spaces", "pricing"],
    queryFn: () => spaceApi.list({}),
  });

  // Update pricing rules mutation
  const updatePricingMutation = useMutation({
    mutationFn: spaceApi.updatePricingRules,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      setIsEditOpen(false);
      setEditingSpace(null);
      toast.success("Pricing rules updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update pricing rules");
    },
  });

  const handleEditPricing = (space: Space) => {
    setEditingSpace(space);
    setIsEditOpen(true);
  };

  const handleUpdatePricing = (data: any) => {
    if (editingSpace) {
      updatePricingMutation.mutate({
        spaceId: editingSpace.id,
        rules: data.rules,
      });
    }
  };

  // Flatten pricing rules for table display
  const pricingData = spacesData?.spaces?.flatMap(space =>
    space.pricingRules?.map(rule => ({
      ...rule,
      spaceId: space.id,
      spaceTitle: space.title,
      spaceSlug: space.slug,
    })) || []
  ) || [];

  const tableColumns = columns({
    onEdit: handleEditPricing,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Space Pricing</h1>
          <p className="text-muted-foreground">
            Manage pricing rules for your rental spaces
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Pricing Rule
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Input
          placeholder="Search spaces..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-64"
        />
        
        <Select
          value={filters.spaceId}
          onValueChange={(value) => setFilters(prev => ({ ...prev, spaceId: value }))}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select space" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Spaces</SelectItem>
            {spacesData?.spaces?.map((space) => (
              <SelectItem key={space.id} value={space.id}>
                {space.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.kind}
          onValueChange={(value) => setFilters(prev => ({ ...prev, kind: value }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Pricing Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="HOURLY">Hourly</SelectItem>
            <SelectItem value="DAILY">Daily</SelectItem>
            <SelectItem value="PEAK">Peak</SelectItem>
            <SelectItem value="CLEANING_FEE">Cleaning Fee</SelectItem>
            <SelectItem value="SECURITY_DEPOSIT">Security Deposit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Rules</CardTitle>
          <CardDescription>
            Manage pricing rules for different time periods and conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={tableColumns}
            data={pricingData}
            isLoading={isLoading}
            pagination={{
              page: 1,
              limit: 50,
              total: pricingData.length,
            }}
          />
        </CardContent>
      </Card>

      {/* Edit Pricing Form */}
      <DrawerForm
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingSpace(null);
        }}
        title="Edit Pricing Rules"
        description="Update pricing rules for this space"
        schema={SpacePricingRulesBulkSchema}
        onSubmit={handleUpdatePricing}
        isLoading={updatePricingMutation.isPending}
      >
        {(form) => editingSpace && (
          <PricingForm
            space={editingSpace}
            onSubmit={handleUpdatePricing}
            isLoading={updatePricingMutation.isPending}
          />
        )}
      </DrawerForm>
    </div>
  );
}
