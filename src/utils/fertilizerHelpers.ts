import { Plant, FertilizerScheduleInfo } from '../types/plant';

/**
 * Extracts the cycle in days from human-readable frequency text
 * like "Every 3 to 4 weeks", "Every 15 days", "Weekly", "Every 2 months"
 */
export function parseFertilizerDays(frequencyText?: string): number {
  if (!frequencyText) return 21; // standard 3-week default for terrace garden pots

  const text = frequencyText.toLowerCase();

  // Pattern: "every X to Y days" or "every X-Y days" or "every X days"
  const daysRangeMatch = text.match(/every\s+(\d+)\s*(?:to|-)\s*(\d+)\s*days?/);
  if (daysRangeMatch) {
    const min = parseInt(daysRangeMatch[1], 10);
    const max = parseInt(daysRangeMatch[2], 10);
    return Math.round((min + max) / 2);
  }

  const daysMatch = text.match(/(?:every\s+)?(\d+)\s*days?/);
  if (daysMatch) {
    return parseInt(daysMatch[1], 10);
  }

  // Pattern: "every X to Y weeks" or "every X-Y weeks"
  const weeksRangeMatch = text.match(/every\s+(\d+)\s*(?:to|-)\s*(\d+)\s*weeks?/);
  if (weeksRangeMatch) {
    const min = parseInt(weeksRangeMatch[1], 10);
    const max = parseInt(weeksRangeMatch[2], 10);
    return Math.round(((min + max) / 2) * 7);
  }

  // Pattern: "every X weeks"
  const weeksMatch = text.match(/(?:every\s+)?(\d+)\s*weeks?/);
  if (weeksMatch) {
    return parseInt(weeksMatch[1], 10) * 7;
  }

  if (text.includes('weekly') || text.includes('once a week')) {
    return 7;
  }

  if (text.includes('fortnight') || text.includes('alternate week') || text.includes('every other week')) {
    return 14;
  }

  // Pattern: "every X to Y months"
  const monthsRangeMatch = text.match(/every\s+(\d+)\s*(?:to|-)\s*(\d+)\s*months?/);
  if (monthsRangeMatch) {
    const min = parseInt(monthsRangeMatch[1], 10);
    const max = parseInt(monthsRangeMatch[2], 10);
    return Math.round(((min + max) / 2) * 30);
  }

  // Pattern: "every X months"
  const monthsMatch = text.match(/(?:every\s+)?(\d+)\s*months?/);
  if (monthsMatch) {
    return parseInt(monthsMatch[1], 10) * 30;
  }

  if (text.includes('monthly') || text.includes('once a month') || text.includes('every month')) {
    return 30;
  }

  if (text.includes('twice a year') || text.includes('every 6 months')) {
    return 180;
  }

  if (text.includes('quarterly') || text.includes('every 3 months')) {
    return 90;
  }

  if (text.includes('yearly') || text.includes('once a year')) {
    return 365;
  }

  return 21;
}

/**
 * Format a Date or date string to YYYY-MM-DD
 */
export function toISODateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format YYYY-MM-DD into readable date (e.g., "14 Sep 2026")
 */
export function formatReadableDate(dateStr?: string): string {
  if (!dateStr) return 'Not recorded';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return dateStr;
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Calculate fertilizer schedule info for a plant
 */
export function calculateFertilizerStatus(plant: Plant, referenceDateStr?: string): FertilizerScheduleInfo {
  const intervalDays = plant.fertilizerCustomDays || parseFertilizerDays(plant.fertilizerRequirement?.frequency);
  const todayStr = referenceDateStr || toISODateString(new Date());

  if (!plant.lastFertilizedDate) {
    return {
      intervalDays,
      lastFertilizedDate: undefined,
      nextDueDate: undefined,
      daysUntilDue: -999,
      status: 'not_set',
      isOverdue: true,
      statusLabel: 'Not yet fertilized',
    };
  }

  // Calculate next due date
  const [lastY, lastM, lastD] = plant.lastFertilizedDate.split('-').map(Number);
  const lastDate = new Date(lastY, lastM - 1, lastD);
  const nextDueDateObj = new Date(lastDate);
  nextDueDateObj.setDate(nextDueDateObj.getDate() + intervalDays);

  const nextDueDateStr = toISODateString(nextDueDateObj);

  // Compare with today
  const [todayY, todayM, todayD] = todayStr.split('-').map(Number);
  const todayDateObj = new Date(todayY, todayM - 1, todayD);

  const diffTime = nextDueDateObj.getTime() - todayDateObj.getTime();
  const daysUntilDue = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (daysUntilDue < 0) {
    const overdueDays = Math.abs(daysUntilDue);
    return {
      intervalDays,
      lastFertilizedDate: plant.lastFertilizedDate,
      nextDueDate: nextDueDateStr,
      daysUntilDue,
      status: 'overdue',
      isOverdue: true,
      statusLabel: `Overdue by ${overdueDays} ${overdueDays === 1 ? 'day' : 'days'}`,
    };
  }

  if (daysUntilDue === 0) {
    return {
      intervalDays,
      lastFertilizedDate: plant.lastFertilizedDate,
      nextDueDate: nextDueDateStr,
      daysUntilDue: 0,
      status: 'due_today',
      isOverdue: true, // Needs action today!
      statusLabel: 'Due today!',
    };
  }

  if (daysUntilDue <= 3) {
    return {
      intervalDays,
      lastFertilizedDate: plant.lastFertilizedDate,
      nextDueDate: nextDueDateStr,
      daysUntilDue,
      status: 'due_soon',
      isOverdue: false,
      statusLabel: `Due in ${daysUntilDue} ${daysUntilDue === 1 ? 'day' : 'days'}`,
    };
  }

  return {
    intervalDays,
    lastFertilizedDate: plant.lastFertilizedDate,
    nextDueDate: nextDueDateStr,
    daysUntilDue,
    status: 'healthy',
    isOverdue: false,
    statusLabel: `Due in ${daysUntilDue} days`,
  };
}
