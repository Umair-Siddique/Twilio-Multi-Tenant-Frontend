const DEFAULT_API_BASE_URL = "https://twilio-multi-tenant-voice-agent.onrender.com";

export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL
};


