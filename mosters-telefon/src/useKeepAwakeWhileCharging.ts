import { BatteryState, useBatteryState } from 'expo-battery';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect } from 'react';

const TAG = 'charging';

// On the charger the phone works like a picture frame of her people;
// on battery the screen may turn off as usual.
export function useKeepAwakeWhileCharging() {
  const state = useBatteryState();
  const charging = state === BatteryState.CHARGING || state === BatteryState.FULL;

  useEffect(() => {
    if (charging) activateKeepAwakeAsync(TAG).catch(() => {});
    else deactivateKeepAwake(TAG).catch(() => {});
  }, [charging]);
}
