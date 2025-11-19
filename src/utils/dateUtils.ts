/**
 * Parse Israeli DD/MM/YYYY date format to Date object
 * @param dateString - Date string in DD/MM/YYYY format
 * @returns Date object or null if invalid
 */
export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  
  const parts = dateString.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  
  const date = new Date(year, month, day);
  
  // Validate the date is real (handles invalid dates like 31/02/2024)
  if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
    return null;
  }
  
  return date;
}

/**
 * Format Date object to Israeli DD/MM/YYYY format
 * @param date - Date object or date string
 * @returns Formatted date string or empty string if invalid
 */
export function formatIsraeliDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  // If it's already a string in DD/MM/YYYY format, return as-is
  if (typeof date === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    return date;
  }
  
  // If it's a string, try to parse it first
  if (typeof date === 'string') {
    const parsed = parseDate(date);
    if (!parsed) return '';
    date = parsed;
  }
  
  // Format Date object
  try {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return '';
  }
}

/**
 * Format date to readable Hebrew format
 * @param date - Date object or date string
 * @returns Formatted date string in Hebrew or empty string if invalid
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  let dateObj: Date;
  
  if (typeof date === 'string') {
    const parsed = parseDate(date);
    if (!parsed) return '';
    dateObj = parsed;
  } else {
    dateObj = date;
  }
  
  try {
    return new Intl.DateTimeFormat('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dateObj);
  } catch (e) {
    return formatIsraeliDate(dateObj);
  }
}
