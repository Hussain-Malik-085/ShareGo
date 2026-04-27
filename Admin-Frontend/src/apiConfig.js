/**
 * App-Backend (ShareGo): http://localhost:4000
 * Agar purana Admin-Backend use ho: http://localhost:4001
 */
const API_ROOT =
  (typeof process !== 'undefined' && process.env.REACT_APP_API_URL) || 'http://localhost:4000';

export {API_ROOT};
