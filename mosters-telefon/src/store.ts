import { Directory, File, Paths } from 'expo-file-system';

import { Contact } from './contacts';

// Everything the nephew configures. One JSON file in the app's document
// folder: survives app updates, needs no extra library, and sits next to
// the cached photos.
export type Config = {
  contacts: Contact[];
  pin: string | null;
  autoAnswer: boolean;
  speaker: boolean;
  updatedAt?: string;
};

const DEFAULT_CONFIG: Config = {
  contacts: [],
  pin: null,
  autoAnswer: true,
  speaker: true,
};

const configFile = new File(Paths.document, 'moster-config.json');
const photoDir = new Directory(Paths.document, 'photos');

export function loadConfig(): Config {
  try {
    if (!configFile.exists) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(configFile.textSync()) };
  } catch (e) {
    console.warn('could not read config, using defaults', e);
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: Config): Config {
  const saved = { ...config, updatedAt: new Date().toISOString() };
  if (!configFile.exists) configFile.create();
  configFile.write(JSON.stringify(saved, null, 2));
  return saved;
}

// Copies a picked photo into our own folder so it survives the contact
// being edited or deleted. A new name each time avoids stale image caches.
export function cachePhoto(sourceUri: string, contactId: string): string {
  if (!photoDir.exists) photoDir.create();
  const target = new File(photoDir, `${contactId}-${Date.now()}.jpg`);
  new File(sourceUri).copy(target);
  return target.uri;
}

export function deletePhoto(uri: string | undefined) {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch (e) {
    console.warn('could not delete photo', e);
  }
}
