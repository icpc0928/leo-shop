export function formatCurrency(amount: number, currency = 'TWD', locale = 'zh-TW') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatDate(date: string | Date, locale = 'zh-TW') {
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(date));
}
