export const filterByDateRange = (data, dateField, range) => {
  if (range === 'all_time') return data;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return data.filter(item => {
    const itemDate = new Date(item[dateField]);
    if (isNaN(itemDate)) return true; // If no valid date, include it or exclude it? Let's include for safety if date is missing

    switch (range) {
      case 'today':
        return itemDate >= today;
      case 'last_7_days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return itemDate >= sevenDaysAgo;
      case 'last_30_days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return itemDate >= thirtyDaysAgo;
      case 'this_month':
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      case 'last_month':
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        return itemDate.getMonth() === lastMonth && itemDate.getFullYear() === year;
      case 'this_year':
        return itemDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  });
};
