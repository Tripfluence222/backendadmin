"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, DollarSign, Clock, Calendar, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Space, SpacePricingRule } from "@/lib/api/space";
import { SpacePricingRuleSchema } from "@/lib/validation/space";

interface PricingFormProps {
  space: Space;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function PricingForm({ space, onSubmit, isLoading }: PricingFormProps) {
  const [rules, setRules] = useState<SpacePricingRule[]>(space.pricingRules || []);
  const [newRule, setNewRule] = useState<Partial<SpacePricingRule>>({
    kind: "HOURLY",
    amount: 0,
    currency: "USD",
    dow: [],
    startHour: undefined,
    endHour: undefined,
  });

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const addRule = () => {
    if (newRule.kind && newRule.amount && newRule.amount > 0) {
      const rule: SpacePricingRule = {
        id: `temp-${Date.now()}`,
        spaceId: space.id,
        kind: newRule.kind as any,
        amount: newRule.amount,
        currency: newRule.currency || "USD",
        dow: newRule.dow || [],
        startHour: newRule.startHour,
        endHour: newRule.endHour,
      };
      
      setRules(prev => [...prev, rule]);
      setNewRule({
        kind: "HOURLY",
        amount: 0,
        currency: "USD",
        dow: [],
        startHour: undefined,
        endHour: undefined,
      });
    }
  };

  const removeRule = (index: number) => {
    setRules(prev => prev.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, field: keyof SpacePricingRule, value: any) => {
    setRules(prev => prev.map((rule, i) => 
      i === index ? { ...rule, [field]: value } : rule
    ));
  };

  const toggleDayOfWeek = (dayIndex: number) => {
    setNewRule(prev => ({
      ...prev,
      dow: prev.dow?.includes(dayIndex)
        ? prev.dow.filter(d => d !== dayIndex)
        : [...(prev.dow || []), dayIndex]
    }));
  };

  const handleSubmit = () => {
    if (rules.length === 0) {
      toast.error("Please add at least one pricing rule");
      return;
    }

    onSubmit({ rules });
  };

  const getKindIcon = (kind: string) => {
    switch (kind) {
      case "HOURLY":
        return Clock;
      case "DAILY":
        return Calendar;
      case "PEAK":
        return Star;
      default:
        return DollarSign;
    }
  };

  const getKindColor = (kind: string) => {
    switch (kind) {
      case "HOURLY":
        return "default";
      case "DAILY":
        return "secondary";
      case "PEAK":
        return "destructive";
      case "CLEANING_FEE":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Space Info */}
      <Card>
        <CardHeader>
          <CardTitle>Space: {space.title}</CardTitle>
        </CardHeader>
      </Card>

      {/* Current Rules */}
      {rules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Pricing Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rules.map((rule, index) => {
              const Icon = getKindIcon(rule.kind);
              return (
                <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getKindColor(rule.kind)}>
                          {rule.kind.replace("_", " ")}
                        </Badge>
                        <span className="font-medium">${rule.amount} {rule.currency}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {rule.dow.length > 0 ? (
                          rule.dow.map(day => dayNames[day]).join(", ")
                        ) : (
                          "All days"
                        )}
                        {rule.startHour !== undefined && rule.endHour !== undefined && (
                          ` • ${rule.startHour}:00 - ${rule.endHour}:00`
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRule(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Add New Rule */}
      <Card>
        <CardHeader>
          <CardTitle>Add Pricing Rule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pricing Type</Label>
              <Select
                value={newRule.kind}
                onValueChange={(value) => setNewRule(prev => ({ ...prev, kind: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOURLY">Hourly Rate</SelectItem>
                  <SelectItem value="DAILY">Daily Rate</SelectItem>
                  <SelectItem value="PEAK">Peak Pricing</SelectItem>
                  <SelectItem value="CLEANING_FEE">Cleaning Fee</SelectItem>
                  <SelectItem value="SECURITY_DEPOSIT">Security Deposit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={newRule.amount || ""}
                  onChange={(e) => setNewRule(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className="pl-10"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Days of Week</Label>
            <div className="grid grid-cols-7 gap-2">
              {dayNames.map((day, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${index}`}
                    checked={newRule.dow?.includes(index) || false}
                    onCheckedChange={() => toggleDayOfWeek(index)}
                  />
                  <Label htmlFor={`day-${index}`} className="text-xs">
                    {day.slice(0, 3)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Hour (24h format)</Label>
              <Input
                type="number"
                value={newRule.startHour || ""}
                onChange={(e) => setNewRule(prev => ({ ...prev, startHour: Number(e.target.value) }))}
                min="0"
                max="23"
                placeholder="e.g., 9"
              />
            </div>

            <div className="space-y-2">
              <Label>End Hour (24h format)</Label>
              <Input
                type="number"
                value={newRule.endHour || ""}
                onChange={(e) => setNewRule(prev => ({ ...prev, endHour: Number(e.target.value) }))}
                min="0"
                max="23"
                placeholder="e.g., 17"
              />
            </div>
          </div>

          <Button type="button" onClick={addRule} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isLoading || rules.length === 0}>
          {isLoading ? "Saving..." : "Save Pricing Rules"}
        </Button>
      </div>
    </div>
  );
}
