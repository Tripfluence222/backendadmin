"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Filter, Eye, CheckCircle, XCircle, MessageSquare, DollarSign } from "lucide-react";
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
import { spaceApi, SpaceRequest } from "@/lib/api/space";
import { columns } from "./columns";
import { RequestDetailsModal } from "./request-details-modal";
import { QuoteModal } from "./quote-modal";

export default function SpaceRequestsPage() {
  const [selectedRequest, setSelectedRequest] = useState<SpaceRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    spaceId: "",
  });

  const queryClient = useQueryClient();

  // Fetch requests
  const { data: requestsData, isLoading } = useQuery({
    queryKey: ["space-requests", filters],
    queryFn: () => spaceApi.listRequests({
      status: filters.status === "all" ? undefined : filters.status as any,
      spaceId: filters.spaceId || undefined,
    }),
  });

  // Quote request mutation
  const quoteMutation = useMutation({
    mutationFn: spaceApi.quoteRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space-requests"] });
      setIsQuoteOpen(false);
      setSelectedRequest(null);
      toast.success("Quote sent successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send quote");
    },
  });

  // Approve request mutation
  const approveMutation = useMutation({
    mutationFn: ({ requestId, message }: { requestId: string; message?: string }) =>
      spaceApi.approveRequest({ requestId, decision: "approve", message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space-requests"] });
      toast.success("Request approved successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to approve request");
    },
  });

  // Decline request mutation
  const declineMutation = useMutation({
    mutationFn: ({ requestId, message }: { requestId: string; message?: string }) =>
      spaceApi.declineRequest({ requestId, decision: "decline", message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space-requests"] });
      toast.success("Request declined");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to decline request");
    },
  });

  const handleViewDetails = (request: SpaceRequest) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  const handleQuote = (request: SpaceRequest) => {
    setSelectedRequest(request);
    setIsQuoteOpen(true);
  };

  const handleApprove = (request: SpaceRequest) => {
    if (confirm(`Approve request for "${request.title}"?`)) {
      approveMutation.mutate({ requestId: request.id });
    }
  };

  const handleDecline = (request: SpaceRequest) => {
    const message = prompt("Reason for declining (optional):");
    declineMutation.mutate({ requestId: request.id, message: message || undefined });
  };

  const handleQuoteSubmit = (data: any) => {
    if (selectedRequest) {
      quoteMutation.mutate({
        requestId: selectedRequest.id,
        ...data,
      });
    }
  };

  const tableColumns = columns({
    onViewDetails: handleViewDetails,
    onQuote: handleQuote,
    onApprove: handleApprove,
    onDecline: handleDecline,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Space Requests</h1>
          <p className="text-muted-foreground">
            Manage booking requests and quotes for your spaces
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Input
          placeholder="Search requests..."
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
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="NEEDS_PAYMENT">Needs Payment</SelectItem>
            <SelectItem value="PAID_HOLD">Paid Hold</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="DECLINED">Declined</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Requests</CardTitle>
          <CardDescription>
            Review and manage space booking requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={tableColumns}
            data={requestsData?.requests || []}
            isLoading={isLoading}
            pagination={{
              page: requestsData?.page || 1,
              limit: requestsData?.limit || 20,
              total: requestsData?.total || 0,
            }}
          />
        </CardContent>
      </Card>

      {/* Request Details Modal */}
      <RequestDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
      />

      {/* Quote Modal */}
      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => {
          setIsQuoteOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onSubmit={handleQuoteSubmit}
        isLoading={quoteMutation.isPending}
      />
    </div>
  );
}
