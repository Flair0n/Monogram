/**
 * Storage utilities for Supabase Storage
 * 
 * Helper functions for uploading, downloading, and managing files
 */

import { supabase } from './supabase';
import { storage } from '../config/env';

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  bucket: keyof typeof storage.buckets,
  path: string,
  file: File
): Promise<{ url: string; path: string }> {
  const bucketName = storage.buckets[bucket];

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
}

/**
 * Upload user avatar
 */
export async function uploadAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;

  return uploadFile('avatars', fileName, file);
}

/**
 * Delete a file from storage
 */
export async function deleteFile(
  bucket: keyof typeof storage.buckets,
  path: string
): Promise<void> {
  const bucketName = storage.buckets[bucket];

  const { error } = await supabase.storage.from(bucketName).remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(
  bucket: keyof typeof storage.buckets,
  path: string
): string {
  const bucketName = storage.buckets[bucket];

  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Download a file
 */
export async function downloadFile(
  bucket: keyof typeof storage.buckets,
  path: string
): Promise<Blob> {
  const bucketName = storage.buckets[bucket];

  const { data, error } = await supabase.storage.from(bucketName).download(path);

  if (error) {
    throw new Error(`Download failed: ${error.message}`);
  }

  return data;
}

/**
 * List files in a directory
 */
export async function listFiles(
  bucket: keyof typeof storage.buckets,
  path: string = ''
) {
  const bucketName = storage.buckets[bucket];

  const { data, error } = await supabase.storage.from(bucketName).list(path);

  if (error) {
    throw new Error(`List failed: ${error.message}`);
  }

  return data;
}

/**
 * Validate file size and type for avatars
 */
export function validateAvatar(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'File type must be JPEG, PNG, WebP, or GIF' };
  }

  return { valid: true };
}
