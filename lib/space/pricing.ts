import { Space, SpacePricingRule, PricingKind } from '@prisma/client';

export interface PricingLine {
  label: string;
  amount: number; // in minor units (cents)
  kind: PricingKind;
}

export interface PricingResult {
  lines: PricingLine[];
  subtotal: number; // in minor units
  total: number; // in minor units
  currency: string;
  breakdown: {
    base: number;
    peak: number;
    cleaning: number;
    deposit: number;
  };
}

export interface SpaceRequestInput {
  start: Date;
  end: Date;
  attendees: number;
}

/**
 * Calculate pricing for a space request based on pricing rules
 */
export function priceSpaceRequest(
  space: Space,
  rules: SpacePricingRule[],
  request: SpaceRequestInput
): PricingResult {
  const durationMs = request.end.getTime() - request.start.getTime();
  const durationHours = Math.ceil(durationMs / (1000 * 60 * 60)); // Round up to nearest hour
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24)); // Round up to nearest day
  
  const lines: PricingLine[] = [];
  let subtotal = 0;
  let base = 0;
  let peak = 0;
  let cleaning = 0;
  let deposit = 0;

  // Get base pricing rule (HOURLY or DAILY)
  const hourlyRule = rules.find(r => r.kind === PricingKind.HOURLY);
  const dailyRule = rules.find(r => r.kind === PricingKind.DAILY);
  
  // Determine if we should use hourly or daily pricing
  const useDaily = dailyRule && durationHours >= 8; // Use daily if 8+ hours
  
  if (useDaily && dailyRule) {
    const dailyAmount = dailyRule.amount * durationDays;
    base = dailyAmount;
    lines.push({
      label: `Daily rate (${durationDays} day${durationDays > 1 ? 's' : ''})`,
      amount: dailyAmount,
      kind: PricingKind.DAILY,
    });
  } else if (hourlyRule) {
    const hourlyAmount = hourlyRule.amount * durationHours;
    base = hourlyAmount;
    lines.push({
      label: `Hourly rate (${durationHours} hour${durationHours > 1 ? 's' : ''})`,
      amount: hourlyAmount,
      kind: PricingKind.HOURLY,
    });
  }

  // Apply peak pricing if applicable
  const peakRule = rules.find(r => r.kind === PricingKind.PEAK);
  if (peakRule && isPeakTime(request.start, request.end, peakRule)) {
    const peakAmount = calculatePeakSurcharge(base, peakRule, request);
    if (peakAmount > 0) {
      peak = peakAmount;
      lines.push({
        label: 'Peak time surcharge',
        amount: peakAmount,
        kind: PricingKind.PEAK,
      });
    }
  }

  // Add cleaning fee
  const cleaningRule = rules.find(r => r.kind === PricingKind.CLEANING_FEE);
  if (cleaningRule) {
    cleaning = cleaningRule.amount;
    lines.push({
      label: 'Cleaning fee',
      amount: cleaning,
      kind: PricingKind.CLEANING_FEE,
    });
  }

  // Add security deposit
  const depositRule = rules.find(r => r.kind === PricingKind.SECURITY_DEPOSIT);
  if (depositRule) {
    deposit = depositRule.amount;
    lines.push({
      label: 'Security deposit',
      amount: deposit,
      kind: PricingKind.SECURITY_DEPOSIT,
    });
  }

  subtotal = base + peak + cleaning;
  const total = subtotal + deposit;

  return {
    lines,
    subtotal,
    total,
    currency: rules[0]?.currency || 'USD',
    breakdown: {
      base,
      peak,
      cleaning,
      deposit,
    },
  };
}

/**
 * Check if the request time falls within peak hours
 */
function isPeakTime(start: Date, end: Date, peakRule: SpacePricingRule): boolean {
  // Check day of week
  if (peakRule.dow && peakRule.dow.length > 0) {
    const startDay = start.getDay();
    const endDay = end.getDay();
    
    // Check if any day in the range matches peak days
    const hasPeakDay = peakRule.dow.some(day => {
      if (startDay <= endDay) {
        return day >= startDay && day <= endDay;
      } else {
        // Weekend wrap-around
        return day >= startDay || day <= endDay;
      }
    });
    
    if (!hasPeakDay) {
      return false;
    }
  }

  // Check time of day
  if (peakRule.startHour !== null && peakRule.endHour !== null) {
    const startHour = start.getHours();
    const endHour = end.getHours();
    
    // Check if request time overlaps with peak hours
    return !(endHour <= peakRule.startHour || startHour >= peakRule.endHour);
  }

  return true;
}

/**
 * Calculate peak surcharge amount
 */
function calculatePeakSurcharge(
  baseAmount: number,
  peakRule: SpacePricingRule,
  request: SpaceRequestInput
): number {
  const durationMs = request.end.getTime() - request.start.getTime();
  const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
  
  // Calculate the peak surcharge as the difference between peak and base rate
  const baseHourlyRate = baseAmount / durationHours;
  const peakSurchargePerHour = Math.max(0, peakRule.amount - baseHourlyRate);
  
  return Math.round(peakSurchargePerHour * durationHours);
}

/**
 * Get minimum hourly rate from pricing rules
 */
export function getMinHourlyRate(rules: SpacePricingRule[]): number {
  const hourlyRule = rules.find(r => r.kind === PricingKind.HOURLY);
  const dailyRule = rules.find(r => r.kind === PricingKind.DAILY);
  
  let minRate = hourlyRule?.amount || 0;
  
  if (dailyRule) {
    // Convert daily rate to hourly (assuming 8-hour day)
    const dailyHourlyRate = Math.ceil(dailyRule.amount / 8);
    minRate = minRate > 0 ? Math.min(minRate, dailyHourlyRate) : dailyHourlyRate;
  }
  
  return minRate;
}

/**
 * Get maximum hourly rate from pricing rules (including peak)
 */
export function getMaxHourlyRate(rules: SpacePricingRule[]): number {
  const hourlyRule = rules.find(r => r.kind === PricingKind.HOURLY);
  const dailyRule = rules.find(r => r.kind === PricingKind.DAILY);
  const peakRule = rules.find(r => r.kind === PricingKind.PEAK);
  
  let maxRate = hourlyRule?.amount || 0;
  
  if (dailyRule) {
    const dailyHourlyRate = Math.ceil(dailyRule.amount / 8);
    maxRate = Math.max(maxRate, dailyHourlyRate);
  }
  
  if (peakRule) {
    maxRate = Math.max(maxRate, peakRule.amount);
  }
  
  return maxRate;
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  });
  
  return formatter.format(amount / 100); // Convert from cents
}

/**
 * Calculate total fees (cleaning + deposit)
 */
export function getTotalFees(rules: SpacePricingRule[]): number {
  const cleaningRule = rules.find(r => r.kind === PricingKind.CLEANING_FEE);
  const depositRule = rules.find(r => r.kind === PricingKind.SECURITY_DEPOSIT);
  
  const cleaning = cleaningRule?.amount || 0;
  const deposit = depositRule?.amount || 0;
  
  return cleaning + deposit;
}

/**
 * Validate pricing rules for consistency
 */
export function validatePricingRules(rules: SpacePricingRule[]): string[] {
  const errors: string[] = [];
  
  // Must have at least one base pricing rule
  const hasHourly = rules.some(r => r.kind === PricingKind.HOURLY);
  const hasDaily = rules.some(r => r.kind === PricingKind.DAILY);
  
  if (!hasHourly && !hasDaily) {
    errors.push('At least one base pricing rule (hourly or daily) is required');
  }
  
  // Check for duplicate rule types
  const ruleTypes = rules.map(r => r.kind);
  const duplicates = ruleTypes.filter((type, index) => ruleTypes.indexOf(type) !== index);
  
  if (duplicates.length > 0) {
    errors.push(`Duplicate pricing rule types: ${duplicates.join(', ')}`);
  }
  
  // Validate peak rule has proper configuration
  const peakRules = rules.filter(r => r.kind === PricingKind.PEAK);
  for (const peakRule of peakRules) {
    if (peakRule.dow && peakRule.dow.length === 0 && 
        (peakRule.startHour === null || peakRule.endHour === null)) {
      errors.push('Peak pricing rule must specify either days of week or time range');
    }
  }
  
  return errors;
}
