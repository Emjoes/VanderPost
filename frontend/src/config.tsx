export const DEBUG = import.meta.env.VITE_DEBUG === 'true';
export const VITE_URL = DEBUG ? '/' : import.meta.env.VITE_PROD_URL;
export const API_URL = VITE_URL + 'backend/api/';
export const GOOGLE_URL = `https://accounts.google.com/o/oauth2/auth?client_id=251305849915-jjvoaqnco8p6bush3hukodl3r7p2s0tm.apps.googleusercontent.com&redirect_uri=${import.meta.env.VITE_PROD_URL}backend/callbacks/google-auth/&response_type=code&state=${DEBUG ? '1' : '0'}&scope=https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile`;
export const INPUT_LIMITS = {
  authName: 100,
  authEmail: 100,
  authPassword: 100,
  telegramChannel: 100,
  toolPrompt: 1500,
  contentPrompt: 3000,
  generatedPostEdit: 3000,
} as const;