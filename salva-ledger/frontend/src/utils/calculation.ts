import { DEFAULT_TAX_PERCENTAGE, TaxPercentage } from '../types/service';

export interface CalculationResult {
  taxAmount: number;
  netProfit: number;
  warning?: string;
}

export interface CalculationContext {
  totalAmount: number;
  vetCost: number;
  driverCost: number;
  extraCost: number;
  taxPercentage?: TaxPercentage;
}

// Re-export the shared calculation function
export const calculateProfit = (
  totalAmount: number,
  vetCost: number,
  driverCost: number,
  extraCost: number,
  taxPercentage: number = DEFAULT_TAX_PERCENTAGE
) => {
  const taxAmount = totalAmount * taxPercentage;
  const netProfit = totalAmount - vetCost - driverCost - extraCost - taxAmount;

  let warning: string | undefined;

  // Warning if total costs exceed total amount
  const totalCosts = vetCost + driverCost + extraCost;
  if (totalAmount < totalCosts) {
    warning = 'Warning: Total costs exceed total amount';
  }

  // Warning if negative net profit (after tax)
  if (netProfit < 0) {
    warning = 'Warning: Net profit is negative';
  }

  return {
    taxAmount,
    netProfit,
    warning,
  };
};

// Calculate preview - only when values are provided
export const calculatePreview = (context?: Partial<CalculationContext>): CalculationResult => {
  const { totalAmount = 0, vetCost = 0, driverCost = 0, extraCost = 0, taxPercentage = DEFAULT_TAX_PERCENTAGE } =
    context || {};
  return calculateProfit(totalAmount, vetCost, driverCost, extraCost, taxPercentage);
};

// Get warning message based on calculation
export const getWarningMessage = (calculation: CalculationResult): string | undefined => {
  const { taxAmount, netProfit, warning } = calculation;
  if (warning) return warning;
  if (netProfit < 0) return 'Warning: Net profit is negative';
  if (netProfit === 0) return 'Warning: No profit on this service';
  return undefined;
};

// Format calculation result for display
export const formatCalculationResult = (
  result: CalculationResult,
  decimals: number = 2
) => ({
  taxFormatted: result.taxAmount.toFixed(decimals),
  profitFormatted: result.netProfit.toFixed(decimals),
  warning: result.warning,
});

// Get default fee for a vet/driver if available
export const getDefaultFee = (
  defaultFee?: number,
  fallback?: number
): number => {
  if (defaultFee !== undefined && defaultFee !== null) return defaultFee;
  return fallback || 0;
};
