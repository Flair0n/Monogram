/**
 * Environment Configuration
 * 
 * Centralized access to environment variables with type safety
 * Only VITE_ prefixed variables are exposed to the frontend
 */

// Supabase Configuration
export const supabase = {
  url: import.meta.env.VITE_SUPABASE_URL as string,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  // Service role key should NEVER be used in frontend
  // Only access this from server-side functions
};

// Application URLs
export const app = {
  url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173/api',
};

// Storage Configuration
export const storage = {
  buckets: {
    avatars: import.meta.env.VITE_STORAGE_BUCKET_AVATARS || 'avatars',
    exports: import.meta.env.VITE_STORAGE_BUCKET_EXPORTS || 'exports',
    badges: import.meta.env.VITE_STORAGE_BUCKET_BADGES || 'badges',
  },
};

// Feature Flags
export const features = {
  emailNotifications: import.meta.env.VITE_FEATURE_EMAIL_NOTIFICATIONS === 'true',
  analytics: import.meta.env.VITE_FEATURE_ANALYTICS === 'true',
  fileUploads: import.meta.env.VITE_FEATURE_FILE_UPLOADS === 'true',
  exportPdf: import.meta.env.VITE_FEATURE_EXPORT_PDF === 'true',
  badges: import.meta.env.VITE_FEATURE_BADGES === 'true',
};

// Analytics
export const analytics = {
  plausible: {
    domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN,
    apiHost: import.meta.env.VITE_PLAUSIBLE_API_HOST,
  },
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN,
  },
};

// Debug Mode
export const debug = import.meta.env.VITE_DEBUG === 'true';

// Environment Check
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Validation - throw errors if critical variables are missing
if (!supabase.url) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabase.anonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Log configuration in development
if (isDevelopment && debug) {
  console.log('🔧 Environment Configuration:', {
    app: app.url,
    features,
    isDevelopment,
  });
}
