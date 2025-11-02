// Room utility functions

/**
 * Generate a shareable room link
 * @param roomId - The room ID
 * @returns Full URL with room parameter
 */
export function generateRoomLink(roomId: string): string {
  const baseUrl = window.location.origin;
  const path = '/boss-tracker';
  return `${baseUrl}${path}?room=${roomId}`;
}

/**
 * Extract room ID from URL query parameters
 * @returns Room ID if present, null otherwise
 */
export function getRoomIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('room');
}

/**
 * Simple hash function for password (client-side only for basic security)
 * Note: For production, use a proper server-side hashing with bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Validate room name
 * @param name - Room name to validate
 * @returns Error message if invalid, null if valid
 */
export function validateRoomName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return 'Nome da sala é obrigatório';
  }

  if (name.trim().length < 3) {
    return 'Nome da sala deve ter pelo menos 3 caracteres';
  }

  if (name.trim().length > 50) {
    return 'Nome da sala deve ter no máximo 50 caracteres';
  }

  return null;
}

/**
 * Validate password
 * @param password - Password to validate
 * @returns Error message if invalid, null if valid
 */
export function validatePassword(password: string): string | null {
  if (!password || password.length === 0) {
    return 'Senha é obrigatória';
  }

  if (password.length < 4) {
    return 'Senha deve ter pelo menos 4 caracteres';
  }

  if (password.length > 50) {
    return 'Senha deve ter no máximo 50 caracteres';
  }

  return null;
}

/**
 * Validate display name
 * @param name - Display name to validate
 * @returns Error message if invalid, null if valid
 */
export function validateDisplayName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return 'Nome de exibição é obrigatório';
  }

  if (name.trim().length < 2) {
    return 'Nome de exibição deve ter pelo menos 2 caracteres';
  }

  if (name.trim().length > 30) {
    return 'Nome de exibição deve ter no máximo 30 caracteres';
  }

  return null;
}

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when copy is successful
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } finally {
      textArea.remove();
    }
  }
}
