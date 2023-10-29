export const formatNumber = (arg) => {
    return new Intl.NumberFormat('en-US').format(arg);
  }

export const formatPrice = (arg) => {
  return new Intl.NumberFormat('en-US', {minimumFractionDigits: 1}).format(arg);
}