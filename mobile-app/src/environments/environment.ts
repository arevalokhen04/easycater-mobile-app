// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  /** Base URL of the EasyCater backend API (see EasyCater/backend-api). */
  apiUrl: 'http://localhost:4000/api/v1',

  /**
   * false = every service talks to the backend API (start it with
   * `npm run dev` in EasyCater/backend-api). true = fixtures only, no backend.
   * Unit tests force this back to true - see booking.service.spec.ts.
   */
  useMockData: false,
};
