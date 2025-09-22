"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, RefreshCw, TestTube, Calendar, Unlink, ExternalLink } from "lucide-react";
import { queryKeys } from "@/lib/api/keys";
import { getProviderDisplayName, getProviderIcon, getProviderColor, isSocialProvider, isEventProvider } from "@/lib/providers";
import { formatExpiryTime, formatTimeAgo } from "@/lib/integrations/status";
import { toast } from "@/lib/ui/toast";
import { env } from "@/lib/env";

interface ProviderCardProps {
  account: any;
  businessId: string;
}

export function ProviderCard({ account, businessId }: ProviderCardProps) {
  const [isDisconnectOpen, setIsDisconnectOpen] = useState(false);
  const queryClient = useQueryClient();
  const useRealProviders = env.FEATURE_REAL_PROVIDERS;

  // Reconnect mutation
  const reconnectMutation = useMutation({
    mutationFn: async (provider: string) => {
      const response = await fetch("/api/integrations/reconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, provider }),
      });
      if (!response.ok) throw new Error("Failed to generate reconnect URL");
      return response.json();
    },
    onSuccess: (data) => {
      window.location.href = data.reconnectUrl;
    },
    onError: (error) => {
      toast.error("Failed to reconnect account", error.message);
    },
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const response = await fetch("/api/integrations/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      if (!response.ok) throw new Error("Failed to disconnect account");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.accounts(businessId) });
      toast.success("Account disconnected successfully");
      setIsDisconnectOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to disconnect account", error.message);
    },
  });

  // Refresh mutation
  const refreshMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const response = await fetch("/api/integrations/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      if (!response.ok) throw new Error("Failed to refresh token");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.accounts(businessId) });
      toast.success("Token refreshed successfully");
    },
    onError: (error) => {
      toast.error("Failed to refresh token", error.message);
    },
  });

  // Test post mutation
  const testPostMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const response = await fetch("/api/integrations/test-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      if (!response.ok) throw new Error("Failed to send test post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.accounts(businessId) });
      toast.success("Test post sent successfully");
    },
    onError: (error) => {
      toast.error("Failed to send test post", error.message);
    },
  });

  // Test event mutation
  const testEventMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const response = await fetch("/api/integrations/test-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      if (!response.ok) throw new Error("Failed to send test event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.accounts(businessId) });
      toast.success("Test event sent successfully");
    },
    onError: (error) => {
      toast.error("Failed to send test event", error.message);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONNECTED": return "bg-green-500";
      case "EXPIRED": return "bg-yellow-500";
      case "ERROR": return "bg-red-500";
      case "DISCONNECTED": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "CONNECTED": return "Connected";
      case "EXPIRED": return "Expired";
      case "ERROR": return "Error";
      case "DISCONNECTED": return "Disconnected";
      default: return "Unknown";
    }
  };

  const copyAccountId = () => {
    navigator.clipboard.writeText(account.id);
    toast.success("Account ID copied to clipboard");
  };

  const providerName = getProviderDisplayName(account.provider);
  const providerIcon = getProviderIcon(account.provider);
  const canRefresh = account.refreshToken && account.provider !== "FACEBOOK_PAGE" && account.provider !== "INSTAGRAM_BUSINESS";
  const canTestPost = isSocialProvider(account.provider);
  const canTestEvent = isEventProvider(account.provider);

  return (
    <Card data-testid={`integration-card-${account.provider.toLowerCase()}`} role="group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{providerIcon}</span>
            <div>
              <CardTitle className="text-sm font-medium">{providerName}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {account.accountName || account.accountId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge className={`${getStatusColor(account.status)} text-white text-xs`}>
              {getStatusText(account.status)}
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAccountId}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy account ID</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Status Info */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Scopes:</span>
            <span>{account.scopes?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expires:</span>
            <span>{formatExpiryTime(account.expiresInSec)}</span>
          </div>
          {account.lastSuccessAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last success:</span>
              <span>{formatTimeAgo(account.lastSuccessAt)}</span>
            </div>
          )}
          {account.lastErrorAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last error:</span>
              <span className="text-red-500">{formatTimeAgo(account.lastErrorAt)}</span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {account.errorMessage && (
          <Alert variant="destructive" className="py-2">
            <AlertDescription className="text-xs">
              {account.errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-1">
          {account.status === "DISCONNECTED" ? (
            <Button
              size="sm"
              onClick={() => reconnectMutation.mutate(account.provider.toLowerCase().replace("_", ""))}
              disabled={reconnectMutation.isPending}
              data-testid={`btn-reconnect-${account.provider.toLowerCase()}`}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Connect
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => reconnectMutation.mutate(account.provider.toLowerCase().replace("_", ""))}
                disabled={reconnectMutation.isPending}
                data-testid={`btn-reconnect-${account.provider.toLowerCase()}`}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Reconnect
              </Button>

              {canRefresh && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => refreshMutation.mutate(account.id)}
                        disabled={refreshMutation.isPending}
                        data-testid={`btn-refresh-${account.provider.toLowerCase()}`}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Refresh token</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {canTestPost && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testPostMutation.mutate(account.id)}
                        disabled={testPostMutation.isPending || !useRealProviders}
                        data-testid={`btn-testpost-${account.provider.toLowerCase()}`}
                      >
                        <TestTube className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{useRealProviders ? "Send test post" : "Real providers disabled"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {canTestEvent && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testEventMutation.mutate(account.id)}
                        disabled={testEventMutation.isPending || !useRealProviders}
                        data-testid={`btn-testevent-${account.provider.toLowerCase()}`}
                      >
                        <Calendar className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{useRealProviders ? "Send test event" : "Real providers disabled"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <Dialog open={isDisconnectOpen} onOpenChange={setIsDisconnectOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    data-testid={`btn-disconnect-${account.provider.toLowerCase()}`}
                  >
                    <Unlink className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Disconnect Account</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to disconnect this {providerName} account? 
                      This will revoke access and stop all automated posting.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDisconnectOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => disconnectMutation.mutate(account.id)}
                      disabled={disconnectMutation.isPending}
                    >
                      Disconnect
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
