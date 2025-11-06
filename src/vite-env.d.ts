/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Supabase
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  
  // Application URLs
  readonly VITE_APP_URL: string;
  readonly VITE_API_BASE_URL: string;
  
  // Storage
  readonly VITE_STORAGE_BUCKET_AVATARS: string;
  readonly VITE_STORAGE_BUCKET_EXPORTS: string;
  readonly VITE_STORAGE_BUCKET_BADGES: string;
  
  // Feature Flags
  readonly VITE_FEATURE_EMAIL_NOTIFICATIONS: string;
  readonly VITE_FEATURE_ANALYTICS: string;
  readonly VITE_FEATURE_FILE_UPLOADS: string;
  readonly VITE_FEATURE_EXPORT_PDF: string;
  readonly VITE_FEATURE_BADGES: string;
  
  // Analytics
  readonly VITE_PLAUSIBLE_DOMAIN?: string;
  readonly VITE_PLAUSIBLE_API_HOST?: string;
  readonly VITE_SENTRY_DSN?: string;
  
  // Debug
  readonly VITE_DEBUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
