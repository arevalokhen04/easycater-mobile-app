// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json.

export const environment = {
  production: true,

  /**
   * The phone reaches the backend through `adb reverse tcp:4000 tcp:4000`
   * (USB debugging) - the device's localhost:4000 forwards to the PC's
   * backend. Run `adb reverse tcp:4000 tcp:4000` after plugging in the phone.
   */
  apiUrl: 'http://localhost:4000/api/v1',

  /** Mock fixtures are development-only; production always talks to the API. */
  useMockData: false,
};
