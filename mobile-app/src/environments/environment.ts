// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  /** Base URL of the EasyCater backend API (see EasyCater/backend-api). */
  apiUrl: 'http://localhost:4000/api/v1',

  /**
   * Services currently serve fixtures from `core/data/mock-data.ts` so the app
   * runs without the backend. Set this to false and restart the API to switch
   * the services over to HTTP.
   */
  useMockData: true,
};
