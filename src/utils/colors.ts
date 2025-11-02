// User color utilities for room members

export const USER_COLORS = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#14b8a6', // teal
  '#a855f7', // purple
  '#eab308', // yellow
];

/**
 * Get a random user color from the palette
 */
export function getRandomUserColor(): string {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}

/**
 * Get user initials from display name
 * @param displayName - User's display name
 * @returns Initials (max 2 characters)
 */
export function getUserInitials(displayName: string): string {
  if (!displayName) return '?';

  const parts = displayName.trim().split(' ');

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Get contrasting text color (black or white) based on background color
 * @param hexColor - Background color in hex format
 * @returns 'black' or 'white'
 */
export function getContrastColor(hexColor: string): 'black' | 'white' {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? 'black' : 'white';
}
