import { Contact as DeviceContact, requestPermissionsAsync } from 'expo-contacts';
import { launchImageLibraryAsync } from 'expo-image-picker';

export type PickedContact = {
  name: string;
  phones: string[];
  imageUri: string | null;
};

// System contact picker. Null if the nephew cancels or denies access.
export async function pickDeviceContact(): Promise<PickedContact | null> {
  const { granted } = await requestPermissionsAsync();
  if (!granted) return null;
  const picked = await DeviceContact.presentPicker();
  if (!picked) return null;
  const [name, phones, imageUri] = await Promise.all([
    picked.getFullName(),
    picked.getPhones(),
    picked.getImage(),
  ]);
  const numbers = phones.map((p) => p.number).filter((n): n is string => !!n);
  return { name, phones: [...new Set(numbers)], imageUri };
}

// Square crop from the gallery, for contacts without a good photo.
export async function pickPhoto(): Promise<string | null> {
  const result = await launchImageLibraryAsync({
    mediaTypes: 'images',
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  return result.canceled ? null : result.assets[0].uri;
}
