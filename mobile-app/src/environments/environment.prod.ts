// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json.

export const environment = {
  production: true,

  /**
   * The PC connects to the phone's Wi-Fi hotspot and hosts the backend.
   * 10.151.28.131 is the hotspot-assigned IP of the PC. If the hotspot
   * subnet ever changes, run `ipconfig` and update this IP, then rebuild.
   * (Fallback: USB + `adb reverse tcp:4000 tcp:4000` with localhost here.)
   */
  apiUrl: 'http://10.151.28.131:4000/api/v1',

  /** Mock fixtures are development-only; production always talks to the API. */
  useMockData: false,
};
