"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, Calculator } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { SpaceRequest } from "@/lib/api/space";
import { SpaceRequestQuoteSchema } from "@/lib/validation/space";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: SpaceRequest | null;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function QuoteModal({ isOpen, onClose, request, onSubmit, isLoading }: QuoteModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(SpaceRequestQuoteSchema.omit({ requestId: true })),
    defaultValues: {
      quoteAmount: 0,
      depositAmount: 0,
      cleaningFee: 0,
      pricingBreakdown: {},
    },
  });

  const quoteAmount = watch("quoteAmount");
  const depositAmount = watch("depositAmount");
  const cleaningFee = watch("cleaningFee");

  const handleFormSubmit = (data: any) => {
    onSubmit(data);
  };

  const calculateTotal = () => {
    return quoteAmount + (cleaningFee || 0);
  };

  const calculateDeposit = () => {
    return depositAmount || Math.round(quoteAmount * 0.2); // 20% default deposit
  };

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Send Quote
          </DialogTitle>
          <DialogDescription>
            Provide pricing details for the booking request
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Request Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Request Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Event:</span> {request.title}
                </div>
                <div>
                  <span className="font-medium">Attendees:</span> {request.attendees}
                </div>
                <div>
                  <span className="font-medium">Date:</span> {new Date(request.start).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Duration:</span>{" "}
                  {Math.round((new Date(request.end).getTime() - new Date(request.start).getTime()) / (1000 * 60 * 60) * 10) / 10} hours
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pricing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quoteAmount">Base Quote Amount *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="quoteAmount"
                    type="number"
                    {...register("quoteAmount", { valueAsNumber: true })}
                    className="pl-10"
                    min="0"
                    step="0.01"
                  />
                </div>
                {errors.quoteAmount && (
                  <p className="text-sm text-destructive">{errors.quoteAmount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="depositAmount">Security Deposit</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="depositAmount"
                    type="number"
                    {...register("depositAmount", { valueAsNumber: true })}
                    className="pl-10"
                    min="0"
                    step="0.01"
                    placeholder={`${calculateDeposit()} (20% of quote)`}
                  />
                </div>
                {errors.depositAmount && (
                  <p className="text-sm text-destructive">{errors.depositAmount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cleaningFee">Cleaning Fee</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cleaningFee"
                    type="number"
                    {...register("cleaningFee", { valueAsNumber: true })}
                    className="pl-10"
                    min="0"
                    step="0.01"
                  />
                </div>
                {errors.cleaningFee && (
                  <p className="text-sm text-destructive">{errors.cleaningFee.message}</p>
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2">
                <Label htmlFor="pricingBreakdown">Pricing Breakdown (JSON)</Label>
                <Textarea
                  id="pricingBreakdown"
                  {...register("pricingBreakdown")}
                  placeholder='{"hourly_rate": 50, "duration_hours": 3, "base_amount": 150}'
                  rows={4}
                />
                {errors.pricingBreakdown && (
                  <p className="text-sm text-destructive">{errors.pricingBreakdown.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quote Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quote Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Quote:</span>
                  <span>${quoteAmount || 0}</span>
                </div>
                {cleaningFee > 0 && (
                  <div className="flex justify-between">
                    <span>Cleaning Fee:</span>
                    <span>${cleaningFee}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Total Amount:</span>
                  <span>${calculateTotal()}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Security Deposit:</span>
                  <span>${calculateDeposit()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Quote"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
