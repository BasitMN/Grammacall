export type Contact = {
  id: string;
  name: string;
  // Optional Arabic spelling, used for the spoken confirmation.
  spokenName?: string;
  phone: string;
  // Local copy in the app's document folder, never the contacts provider URI.
  photoUri?: string;
  position: number;
  // Answer this person's calls automatically. Missing = yes (contacts saved
  // before the per-contact switch existed keep their old behaviour).
  autoAnswer?: boolean;
};

// Phone contacts are often saved as "4670-718 81 29" or "0046 70…". Without
// a leading "+", "4670…" is not a valid Swedish number, and it doesn't match
// the "+4670…" the network reports for incoming calls (breaking auto-answer).
// Swedish national numbers always start with 0, so a bare "46…" of normal
// length can only mean the country code.
export function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/[^\d]/g, '');
  if (trimmed.startsWith('+')) return `+${digits}`;
  if (digits.startsWith('00')) return `+${digits.slice(2)}`;
  if (digits.startsWith('46') && digits.length >= 10) return `+${digits}`;
  return digits;
}

export function answersAutomatically(contact: Contact): boolean {
  return contact.autoAnswer !== false;
}

// 9 tiles is a 3×3 grid; more would make tiles too small for her.
export const MAX_CONTACTS = 9;
