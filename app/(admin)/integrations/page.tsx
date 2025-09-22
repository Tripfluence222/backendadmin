"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { queryKeys } from "@/lib/api/keys";
import { env } from "@/lib/env";
import { ProviderCard } from "./components/ProviderCard";
import { LogsTable } from "./components/LogsTable";
import { getMockUser } from "@/lib/auth-client";

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState("connections");
  const user = getMockUser();
  const businessId = user.businessId;

  // Fetch integration accounts
  const { data: accountsData, isLoading: accountsLoading, error: accountsError } = useQuery({
    queryKey: queryKeys.integrations.accounts(businessId),
    queryFn: async () => {
      const response = await fetch(`/api/integrations/accounts?businessId=${businessId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch integration accounts");
      }
      return response.json();
    },
  });

  // Fetch integration logs
  const { data: logsData, isLoading: logsLoading, error: logsError } = useQuery({
    queryKey: queryKeys.integrations.logs(businessId),
    queryFn: async () => {
      const response = await fetch(`/api/integrations/logs?businessId=${businessId}&limit=50`);
      if (!response.ok) {
        throw new Error("Failed to fetch integration logs");
      }
      return response.json();
    },
  });

  const accounts = accountsData?.accounts || [];
  const logs = logsData?.logs || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Manage your social media and event platform connections
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={env.FEATURE_REAL_PROVIDERS ? "default" : "secondary"}>
            {env.FEATURE_REAL_PROVIDERS ? "Real Providers" : "Mock Mode"}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          {accountsError && (
            <Alert variant="destructive">
              <AlertDescription>
                Failed to load integration accounts: {accountsError.message}
              </AlertDescription>
            </Alert>
          )}

          {accountsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Connected Accounts</CardTitle>
                <CardDescription>
                  Connect your social media and event platform accounts to get started.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { provider: "facebook", name: "Facebook Page", icon: "📘" },
                    { provider: "instagram", name: "Instagram Business", icon: "📷" },
                    { provider: "google", name: "Google Business", icon: "🏢" },
                    { provider: "eventbrite", name: "Eventbrite", icon: "🎫" },
                    { provider: "meetup", name: "Meetup", icon: "👥" },
                  ].map((platform) => (
                    <Card key={platform.provider} className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                        <div className="text-4xl mb-2">{platform.icon}</div>
                        <h3 className="font-semibold mb-1">{platform.name}</h3>
                        <Button
                          size="sm"
                          onClick={() => {
                            window.location.href = `/api/auth/connect/${platform.provider}?businessId=${businessId}`;
                          }}
                        >
                          Connect
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account: any) => (
                <ProviderCard
                  key={account.id}
                  account={account}
                  businessId={businessId}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          {logsError && (
            <Alert variant="destructive">
              <AlertDescription>
                Failed to load integration logs: {logsError.message}
              </AlertDescription>
            </Alert>
          )}

          {logsLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <LogsTable logs={logs} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
