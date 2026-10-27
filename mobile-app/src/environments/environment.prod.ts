// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.prod.ts` with `environment.ts`.
// The list of file replacements can be found in `angular.json.

export const environment = {
  production: true,

  /** Base URL of the EasyCater backend API (see EasyCater/backend-api). */
  apiUrl: 'https://api.easycater.com/api/v1',

  /** Mock fixtures are development-only; production always talks to the API. */
  useMockData: false,
};
