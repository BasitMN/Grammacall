export type Contact = {
  id: string;
  name: string;
  // Optional Arabic spelling, used for the spoken confirmation.
  spokenName?: string;
  phone: string;
  // Local copy in the app's document folder, never the contacts provider URI.
  photoUri?: string;
  position: number;
};

// 9 tiles is a 3×3 grid; more would make tiles too small for her.
export const MAX_CONTACTS = 9;
