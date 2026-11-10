export const environment = {
  production: true,

  /**
   * The PC connects to the phone's Wi-Fi hotspot and hosts the backend.
   * 10.151.28.131 is the hotspot-assigned IP of the PC. If the hotspot
   * subnet ever changes, run `ipconfig` and update this IP, then rebuild.
   * (Fallback: USB + `adb reverse tcp:4000 tcp:4000` with localhost here.)
   */
  apiUrl: 'http://10.195.198.195:4000/api/v1',

  useMockData: false,
};
