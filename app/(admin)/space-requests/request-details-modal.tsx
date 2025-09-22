"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Users, MapPin, MessageSquare, Send, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { spaceApi, SpaceRequest } from "@/lib/api/space";

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: SpaceRequest | null;
}

export function RequestDetailsModal({ isOpen, onClose, request }: RequestDetailsModalProps) {
  const [newMessage, setNewMessage] = useState("");
  const queryClient = useQueryClient();

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: spaceApi.sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space-requests"] });
      setNewMessage("");
      toast.success("Message sent successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  const handleSendMessage = () => {
    if (request && newMessage.trim()) {
      sendMessageMutation.mutate({
        spaceReqId: request.id,
        body: newMessage.trim(),
      });
    }
  };

  if (!request) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "default";
      case "PENDING":
        return "secondary";
      case "NEEDS_PAYMENT":
        return "outline";
      case "DECLINED":
      case "EXPIRED":
      case "CANCELLED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{request.title}</span>
            <Badge variant={getStatusColor(request.status)}>
              {request.status.replace("_", " ")}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Booking request details and communication
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Request Information */}
          <Card>
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Date & Time</span>
                  </div>
                  <div className="text-sm">
                    {format(new Date(request.start), "EEEE, MMMM d, yyyy")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(request.start), "h:mm a")} - {format(new Date(request.end), "h:mm a")}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Attendees</span>
                  </div>
                  <div className="text-sm">{request.attendees} people</div>
                </div>
              </div>

              {request.description && (
                <div className="space-y-2">
                  <span className="font-medium">Description</span>
                  <p className="text-sm text-muted-foreground">{request.description}</p>
                </div>
              )}

              <div className="space-y-2">
                <span className="font-medium">Organizer</span>
                <div className="text-sm">
                  {request.organizerName} ({request.organizerEmail})
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          {request.quoteAmount && (
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Quote Amount:</span>
                  <span className="font-medium">${request.quoteAmount}</span>
                </div>
                {request.depositAmount && (
                  <div className="flex items-center justify-between">
                    <span>Deposit:</span>
                    <span className="font-medium">${request.depositAmount}</span>
                  </div>
                )}
                {request.cleaningFee && (
                  <div className="flex items-center justify-between">
                    <span>Cleaning Fee:</span>
                    <span className="font-medium">${request.cleaningFee}</span>
                  </div>
                )}
                {request.pricingBreakdown && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Pricing Breakdown:</span>
                    <pre className="text-xs mt-2 text-muted-foreground">
                      {JSON.stringify(request.pricingBreakdown, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {request.messages && request.messages.length > 0 ? (
                <div className="space-y-3">
                  {request.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.isFromHost
                          ? "bg-primary/10 ml-8"
                          : "bg-muted mr-8"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {message.isFromHost ? "You" : request.organizerName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.createdAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm">{message.body}</p>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-muted-foreground">Attachments:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {message.attachments.map((attachment, index) => (
                              <a
                                key={index}
                                href={attachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                Attachment {index + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No messages yet</p>
              )}

              {/* Send Message */}
              <div className="space-y-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    size="sm"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
