import {API_BASE_URL} from '@env';

const devAndroidFallback = 'http://10.0.2.2:4000/api';

export const BASE_URL =
  API_BASE_URL && String(API_BASE_URL).trim() !== ''
    ? API_BASE_URL
    : devAndroidFallback;
