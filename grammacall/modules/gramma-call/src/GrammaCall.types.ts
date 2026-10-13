export type GrammaCallModuleEvents = {
  // Home button pressed while the app (the launcher) is already in front.
  onHomePressed: () => void;
};

// What the native call screen needs to show who is calling.
export type NativeContact = {
  name: string;
  spokenName?: string;
  phone: string;
  photoUri?: string;
  position: number;
};

export type DeviceInfo = {
  manufacturer: string;
  model: string;
  release: string;
  sdkInt: number;
};
