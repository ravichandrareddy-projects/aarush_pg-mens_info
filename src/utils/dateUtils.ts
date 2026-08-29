// Date formatting utility to format dates as "1st, 2026", "15th, 2026", "28th, 2026" (No month name)

export function getOrdinalSuffix(day: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = day % 100;
  return day + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function formatDayAndYear(dateStr?: string, dueDay?: number): string {
  if (dueDay && dueDay > 0) {
    return `${getOrdinalSuffix(dueDay)}, 2026`;
  }
  
  if (!dateStr) return '1st, 2026';

  // Handle YYYY-MM-DD or ISO string
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const dayNum = parseInt(parts[2], 10) || 1;
    return `${getOrdinalSuffix(dayNum)}, ${year}`;
  }

  return dateStr;
}

export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) {
    return 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good afternoon';
  } else if (hour >= 17 && hour < 22) {
    return 'Good evening';
  } else {
    return 'Good night';
  }
}
