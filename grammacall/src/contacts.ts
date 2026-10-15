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

export function answersAutomatically(contact: Contact): boolean {
  return contact.autoAnswer !== false;
}

// 9 tiles is a 3×3 grid; more would make tiles too small for her.
export const MAX_CONTACTS = 9;
