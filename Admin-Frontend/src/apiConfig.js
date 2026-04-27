/** Same server as sharego-backend (port 4000 by default) */
const API_ROOT =
  (typeof process !== 'undefined' && process.env.REACT_APP_API_URL) || 'http://localhost:4000';

export {API_ROOT};
