
export const getTodayStr = () => new Date().toISOString().split('T')[0];

export const getDatesForRange = (days: number) => {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

export const formatDate = (dateStr: string) => {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString(undefined, options);
};

export const getMonthStr = (date: Date = new Date()) => {
  return date.toISOString().slice(0, 7); // YYYY-MM
};

export const getDaysInMonth = (monthStr: string) => {
  const [year, month] = monthStr.split('-').map(Number);
  return new Date(year, month, 0).getDate();
};
