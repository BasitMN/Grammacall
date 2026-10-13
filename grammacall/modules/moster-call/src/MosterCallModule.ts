import { NativeModule, requireNativeModule } from 'expo';

import { DeviceInfo, MosterCallModuleEvents, NativeContact } from './MosterCall.types';

declare class MosterCallModule extends NativeModule<MosterCallModuleEvents> {
  getDeviceInfo(): DeviceInfo;
  setWhitelist(numbers: string[]): void;
  getWhitelist(): string[];
  setSpeaker(enabled: boolean): void;
  setContacts(contacts: NativeContact[]): void;
  hasDialerRole(): boolean;
  requestDialerRole(): void;
  placeCall(number: string): void;
  hasHomeRole(): boolean;
  requestHomeRole(): void;
  openHomeSettings(): void;
  isIgnoringBatteryOptimizations(): boolean;
  requestIgnoreBatteryOptimizations(): void;
  setRoleWarning(show: boolean): void;
}

export default requireNativeModule<MosterCallModule>('MosterCall');
