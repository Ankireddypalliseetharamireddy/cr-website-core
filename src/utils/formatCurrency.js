
export const formatCurrency = (amount, currency = 'USD', compact = false) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0';

  if (compact) {
    if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 2)}M`;
    }
    if (amount >= 1_000) {
      return `$${(amount / 1_000).toFixed(0)}k`;
    }
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercentage = (rate) => {
  if (rate === undefined || rate === null) return '0%';
  return `${rate.toFixed(1)}%`;
};
