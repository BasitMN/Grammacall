import * as Speech from 'expo-speech';

import GrammaCall from '../modules/gramma-call';
import { Contact } from './contacts';

// All UI text is Swedish, but she only understands Arabic, so the spoken
// confirmations are Arabic ("Calling …").
export function speakCalling(contact: Contact) {
  Speech.stop();
  // Speech uses the media volume, which may be low; she must hear it.
  try {
    GrammaCall.maximizeSpeechVolume();
  } catch (e) {
    console.warn('could not raise speech volume', e);
  }
  Speech.speak(`جاري الاتصال بـ ${contact.spokenName || contact.name}`, { language: 'ar' });
}

export function stopSpeaking() {
  Speech.stop();
}

export async function hasArabicVoice(): Promise<boolean> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices.some((v) => v.language.toLowerCase().startsWith('ar'));
  } catch {
    return false;
  }
}
