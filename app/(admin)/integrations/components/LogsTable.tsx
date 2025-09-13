"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Filter } from "lucide-react";
import { formatTimeAgo } from "@/lib/integrations/status";

interface LogsTableProps {
  logs: any[];
}

export function LogsTable({ logs }: LogsTableProps) {
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const filteredLogs = logs.filter(log => {
    if (filterType === "all") return true;
    return log.type === filterType;
  });

  const getStatusColor = (status: number | string) => {
    if (typeof status === "number") {
      if (status >= 200 && status < 300) return "bg-green-500";
      if (status >= 400 && status < 500) return "bg-yellow-500";
      if (status >= 500) return "bg-red-500";
      return "bg-gray-500";
    }
    return "bg-gray-500";
  };

  const getStatusText = (status: number | string) => {
    if (typeof status === "number") {
      return status.toString();
    }
    return status;
  };

  const getActionText = (log: any) => {
    if (log.type === "webhook") {
      return log.eventType;
    }
    return log.action;
  };

  const getEntityText = (log: any) => {
    if (log.type === "webhook") {
      return `Webhook ${log.endpointId || "Unknown"}`;
    }
    return `${log.entityType} ${log.entityId}`;
  };

  const getActorText = (log: any) => {
    if (log.type === "webhook") {
      return "System";
    }
    return `${log.actorType} ${log.actorId}`;
  };

  return (
    <Card data-testid="logs-table">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Integration Logs</CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32" data-testid="logs-filter-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
                <SelectItem value="audit">Audit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No logs found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">
                    {formatTimeAgo(new Date(log.createdAt))}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {log.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {getActionText(log)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {getEntityText(log)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`${getStatusColor(log.status)} text-white text-xs`}
                    >
                      {getStatusText(log.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {getActorText(log)}
                  </TableCell>
                  <TableCell>
                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>
                            {log.type === "webhook" ? "Webhook Delivery" : "Audit Log"} Details
                          </DrawerTitle>
                        </DrawerHeader>
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">ID</label>
                              <p className="text-sm text-muted-foreground">{log.id}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Created At</label>
                              <p className="text-sm text-muted-foreground">
                                {new Date(log.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Type</label>
                              <p className="text-sm text-muted-foreground">{log.type}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Status</label>
                              <p className="text-sm text-muted-foreground">{getStatusText(log.status)}</p>
                            </div>
                          </div>

                          {log.type === "webhook" ? (
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Event Type</label>
                                <p className="text-sm text-muted-foreground">{log.eventType}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Duration</label>
                                <p className="text-sm text-muted-foreground">{log.durationMs}ms</p>
                              </div>
                              {log.requestBody && (
                                <div>
                                  <label className="text-sm font-medium">Request Body</label>
                                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                                    {JSON.stringify(log.requestBody, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.responseBody && (
                                <div>
                                  <label className="text-sm font-medium">Response Body</label>
                                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                                    {JSON.stringify(log.responseBody, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Action</label>
                                <p className="text-sm text-muted-foreground">{log.action}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Entity Type</label>
                                <p className="text-sm text-muted-foreground">{log.entityType}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Entity ID</label>
                                <p className="text-sm text-muted-foreground">{log.entityId}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Actor</label>
                                <p className="text-sm text-muted-foreground">
                                  {log.actorType} ({log.actorId})
                                </p>
                              </div>
                              {log.metadata && (
                                <div>
                                  <label className="text-sm font-medium">Metadata</label>
                                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                                    {JSON.stringify(log.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </DrawerContent>
                    </Drawer>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
