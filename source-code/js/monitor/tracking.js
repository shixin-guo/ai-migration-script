
import { trackingListConstant } from "./constant";
// todo use npm package when local develop
const monitorSDK = (window as any).__MONITOR__;

export const trackingList = trackingListConstant;
export const updateConfig = monitorSDK?.updateConfig || (() => {});

interface TrackingParams {
  label?: string;
  [key: string]: any;
}

export const tracking = (params: TrackingParams) => {
  // eslint-disable-next-line no-console
  __DEV__ && console.log("User Behaviour Tracking", JSON.stringify(params));
  if (!monitorSDK?.tracking) return;
  if (!params.label) return;
  try {
    monitorSDK?.tracking({ ...params });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
};
