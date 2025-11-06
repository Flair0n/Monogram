/**
 * Supabase API Helpers for Space Management
 * Direct database operations using Supabase client
 */

import { supabase } from './supabase';

export type AccessType = 'PUBLIC' | 'PRIVATE';
export type CuratorRotationType = 'ROUND_ROBIN' | 'RANDOM' | 'MANUAL';

export interface CreateSpaceData {
  name: string;
  description?: string;
  leaderId: string;
  accessType?: AccessType;
  rotationType?: CuratorRotationType;
  publishDay?: number; // 0 = Sunday, 6 = Saturday
}

export interface Space {
  id: string;
  name: string;
  description: string | null;
  leader_id: string;
  access_type: AccessType;
  current_week: number;
  current_curator_id: string | null;
  rotation_type: CuratorRotationType;
  publish_day: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpaceWithDetails extends Space {
  leader: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  current_curator: {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null;
  member_count: number;
  unread_responses?: number;
}

/**
 * Create a new space
 */
export async function createSpace(data: CreateSpaceData): Promise<Space> {
  const now = new Date().toISOString();
  
  const { data: space, error } = await supabase
    .from('spaces')
    .insert({
      name: data.name,
      description: data.description || null,
      leader_id: data.leaderId,
      access_type: data.accessType || 'PUBLIC',
      rotation_type: data.rotationType || 'ROUND_ROBIN',
      publish_day: data.publishDay ?? 0,
      current_week: 1,
      is_published: false,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw error;

  // Create membership for the leader
  const { error: membershipError } = await supabase
    .from('memberships')
    .insert({
      space_id: space.id,
      user_id: data.leaderId,
      role: 'LEADER',
      joined_at: now,
    });

  if (membershipError) throw membershipError;

  return space;
}

/**
 * Get user's spaces with details
 */
export async function getUserSpaces(userId: string): Promise<SpaceWithDetails[]> {
  // First get spaces where user is a member
  const { data: memberships, error: membershipsError } = await supabase
    .from('memberships')
    .select('space_id')
    .eq('user_id', userId);

  if (membershipsError) throw membershipsError;

  const spaceIds = memberships.map(m => m.space_id);

  if (spaceIds.length === 0) {
    return [];
  }

  // Get space details with leader and curator info
  const { data: spaces, error: spacesError } = await supabase
    .from('spaces')
    .select(`
      *,
      leader:users!spaces_leader_id_fkey(id, name, avatar_url),
      current_curator:users!spaces_current_curator_id_fkey(id, name, avatar_url)
    `)
    .in('id', spaceIds)
    .order('updated_at', { ascending: false });

  if (spacesError) throw spacesError;

  // Get member counts for each space
  const spacesWithCounts = await Promise.all(
    spaces.map(async (space) => {
      const { count } = await supabase
        .from('memberships')
        .select('*', { count: 'exact', head: true })
        .eq('space_id', space.id);

      return {
        ...space,
        member_count: count || 0,
      };
    })
  );

  return spacesWithCounts;
}

/**
 * Join a space (for public spaces or with invite)
 */
export async function joinSpace(spaceId: string, userId: string): Promise<void> {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from('memberships')
    .insert({
      space_id: spaceId,
      user_id: userId,
      role: 'MEMBER',
      joined_at: now,
    });

  if (error) throw error;
}

/**
 * Get space by ID
 */
export async function getSpace(spaceId: string): Promise<SpaceWithDetails | null> {
  const { data: space, error } = await supabase
    .from('spaces')
    .select(`
      *,
      leader:users!spaces_leader_id_fkey(id, name, avatar_url),
      current_curator:users!spaces_current_curator_id_fkey(id, name, avatar_url)
    `)
    .eq('id', spaceId)
    .single();

  if (error) throw error;

  // Get member count
  const { count } = await supabase
    .from('memberships')
    .select('*', { count: 'exact', head: true })
    .eq('space_id', spaceId);

  return {
    ...space,
    member_count: count || 0,
  };
}

/**
 * Update space settings
 */
export async function updateSpace(
  spaceId: string,
  updates: Partial<{
    name: string;
    description: string;
    access_type: AccessType;
    rotation_type: CuratorRotationType;
    publish_day: number;
    current_curator_id: string;
  }>
): Promise<void> {
  const { error } = await supabase
    .from('spaces')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', spaceId);

  if (error) throw error;
}

/**
 * Delete/leave a space
 */
export async function leaveSpace(spaceId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('memberships')
    .delete()
    .eq('space_id', spaceId)
    .eq('user_id', userId);

  if (error) throw error;
}
