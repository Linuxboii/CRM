export const MONTHLY_GOAL_INR = 100000;

export const parseCurrencyValue = (value?: string | number | null) => {
  if (typeof value === 'number') return value;
  const parsed = parseInt((value || '0').toString().replace(/\D/g, ''), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const formatInr = (value: number) =>
  value.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
