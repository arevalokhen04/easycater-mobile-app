export const environment = {
  production: false,

  /** Base URL of the EasyCater backend API (see EasyCater/backend-api). */
  apiUrl: 'http://localhost:4000/api/v1',

  /**
   * false = every admin service talks to the backend API (start it with
   * `npm run dev` in EasyCater/backend-api). true = fixtures only.
   */
  useMockData: false,
};
