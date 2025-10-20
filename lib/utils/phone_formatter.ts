/**
 * Format số điện thoại Việt Nam cho Zalo API
 * Zalo yêu cầu format: 84 + 9 số (VD: 84912345678)
 *
 * Input examples:
 * - 0912345678 → 84912345678
 * - +84912345678 → 84912345678
 * - 84912345678 → 84912345678
 * - 0912 345 678 → 84912345678
 */
export function formatPhoneForZalo(phone: string): string {
  if (!phone) {
    throw new Error('Phone number is required');
  }

  // Remove all spaces, dashes, dots, parentheses
  let cleaned = phone.replace(/[\s\-\.\(\)]/g, '');

  // Remove leading + if exists
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Handle Vietnamese phone numbers
  if (cleaned.startsWith('0')) {
    // 0912345678 → 84912345678
    cleaned = '84' + cleaned.substring(1);
  } else if (!cleaned.startsWith('84')) {
    // Assume it's a local number without country code
    cleaned = '84' + cleaned;
  }

  // Validate format: must be 84 + 9 digits
  if (!/^84\d{9}$/.test(cleaned)) {
    throw new Error(`Invalid Vietnamese phone number format: ${phone}. Expected format: 84xxxxxxxxx or 0xxxxxxxxx`);
  }

  return cleaned;
}

/**
 * Format số điện thoại cho hiển thị
 * VD: 84912345678 → 0912 345 678
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return '';

  let cleaned = phone.replace(/[\s\-\.\(\)]/g, '');

  // Remove country code if exists
  if (cleaned.startsWith('84')) {
    cleaned = '0' + cleaned.substring(2);
  } else if (cleaned.startsWith('+84')) {
    cleaned = '0' + cleaned.substring(3);
  }

  // Format: 0912 345 678
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
  }

  return cleaned;
}

/**
 * Validate Vietnamese phone number
 */
export function isValidVietnamesePhone(phone: string): boolean {
  if (!phone) return false;

  try {
    const formatted = formatPhoneForZalo(phone);
    return /^84\d{9}$/.test(formatted);
  } catch {
    return false;
  }
}

/**
 * Normalize phone number (remove all formatting)
 */
export function normalizePhone(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[\s\-\.\(\)\+]/g, '');
}

/**
 * Extract country code from phone
 */
export function extractCountryCode(phone: string): string {
  const cleaned = normalizePhone(phone);

  if (cleaned.startsWith('84')) {
    return '84';
  } else if (cleaned.startsWith('1')) {
    return '1';
  } else if (cleaned.startsWith('86')) {
    return '86';
  }

  return '84'; // Default to Vietnam
}
