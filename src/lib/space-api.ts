/**
 * Supabase API Helpers for Space Management
 * Direct database operations using Supabase client
 */

import { supabase } from './supabase';

export type CuratorRotationType = 'ROUND_ROBIN' | 'RANDOM' | 'MANUAL';

export interface CreateSpaceData {
  name: string;
  description?: string;
  leaderId: string;
  rotationType?: CuratorRotationType;
  publishDay?: number; // 0 = Sunday, 6 = Saturday
}

export interface Space {
  id: string;
  name: string;
  description: string | null;
  leader_id: string;
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

  // Create membership for the leader as ADMIN
  const { error: membershipError } = await supabase
    .from('memberships')
    .insert({
      space_id: space.id,
      user_id: data.leaderId,
      role: 'ADMIN',
      weekly_streak: 0,
      total_submissions: 0,
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
 * Get space by name
 */
export async function getSpaceByName(spaceName: string): Promise<SpaceWithDetails | null> {
  const { data: space, error } = await supabase
    .from('spaces')
    .select(`
      *,
      leader:users!spaces_leader_id_fkey(id, name, avatar_url),
      current_curator:users!spaces_current_curator_id_fkey(id, name, avatar_url)
    `)
    .eq('name', spaceName)
    .maybeSingle();

  if (error) throw error;
  if (!space) return null;

  // Get member count
  const { count } = await supabase
    .from('memberships')
    .select('*', { count: 'exact', head: true })
    .eq('space_id', space.id);

  return {
    ...space,
    member_count: count || 0,
  };
}

/**
 * Get space members
 */
export async function getSpaceMembers(spaceId: string) {
  const { data, error } = await supabase
    .from('memberships')
    .select(`
      *,
      user:users(id, name, email, avatar_url)
    `)
    .eq('space_id', spaceId)
    .order('joined_at', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Get current week prompts for a space
 */
export async function getCurrentWeekPrompts(spaceId: string, weekNumber: number) {
  const { data, error } = await supabase
    .from('prompts')
    .select(`
      *,
      curator:users(id, name, avatar_url)
    `)
    .eq('space_id', spaceId)
    .eq('week_number', weekNumber)
    .eq('is_published', true)
    .order('order', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Create prompts for a week
 */
export async function createPrompt(data: {
  spaceId: string;
  curatorId: string;
  weekNumber: number;
  question: string;
  order: number;
  imageUrl?: string;
  musicUrl?: string;
  isPublished?: boolean;
}) {
  const now = new Date().toISOString();

  const { data: prompt, error } = await supabase
    .from('prompts')
    .insert({
      space_id: data.spaceId,
      curator_id: data.curatorId,
      week_number: data.weekNumber,
      question: data.question,
      order: data.order,
      image_url: data.imageUrl || null,
      music_url: data.musicUrl || null,
      is_published: data.isPublished ?? true,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw error;
  return prompt;
}

/**
 * Delete a prompt
 */
export async function deletePrompt(promptId: string) {
  const { error } = await supabase
    .from('prompts')
    .delete()
    .eq('id', promptId);

  if (error) throw error;
}

/**
 * Get user's responses for current week
 */
export async function getUserWeekResponses(userId: string, spaceId: string, weekNumber: number) {
  const { data, error } = await supabase
    .from('responses')
    .select(`
      *,
      prompt:prompts(id, question, order, week_number)
    `)
    .eq('user_id', userId)
    .eq('prompt.space_id', spaceId)
    .eq('prompt.week_number', weekNumber);

  if (error) throw error;
  return data || [];
}

/**
 * Get all user responses in a space
 */
export async function getUserResponses(userId: string, spaceId: string) {
  const { data, error } = await supabase
    .from('responses')
    .select(`
      *,
      prompt:prompts(id, question, week_number, space_id)
    `)
    .eq('user_id', userId)
    .eq('is_draft', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Filter by space_id
  return (data || []).filter(r => r.prompt?.space_id === spaceId);
}

/**
 * Submit or update a response
 */
export async function submitResponse(data: {
  promptId: string;
  userId: string;
  content: string;
  imageUrl?: string;
  musicUrl?: string;
  isDraft?: boolean;
}) {
  const now = new Date().toISOString();

  const { data: response, error } = await supabase
    .from('responses')
    .upsert({
      prompt_id: data.promptId,
      user_id: data.userId,
      content: data.content,
      image_url: data.imageUrl || null,
      music_url: data.musicUrl || null,
      is_draft: data.isDraft ?? false,
      updated_at: now,
    }, {
      onConflict: 'prompt_id,user_id'
    })
    .select()
    .single();

  if (error) throw error;
  return response;
}

/**
 * Get archived weeks for a space
 */
export async function getArchivedWeeks(spaceId: string, currentWeek: number, userId: string) {
  // Get all past weeks (weeks before current week)
  const { data: prompts, error } = await supabase
    .from('prompts')
    .select(`
      *,
      curator:users(id, name, avatar_url),
      responses(
        id,
        content,
        user_id,
        is_draft,
        created_at
      )
    `)
    .eq('space_id', spaceId)
    .lt('week_number', currentWeek)
    .eq('is_published', true)
    .order('week_number', { ascending: false });

  if (error) throw error;

  // Group prompts by week
  const weekMap = new Map();
  
  prompts?.forEach((prompt: any) => {
    if (!weekMap.has(prompt.week_number)) {
      weekMap.set(prompt.week_number, {
        weekNumber: prompt.week_number,
        curator: prompt.curator?.name || 'Unknown',
        prompts: []
      });
    }
    
    const userResponse = prompt.responses?.find((r: any) => r.user_id === userId && !r.is_draft);
    
    weekMap.get(prompt.week_number).prompts.push({
      id: prompt.id,
      text: prompt.question,
      userResponse: userResponse ? {
        content: userResponse.content,
        wordCount: userResponse.content.split(/\s+/).filter((w: string) => w.length > 0).length,
        publishedAt: new Date(userResponse.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      } : null
    });
  });

  // Convert map to array and calculate stats
  const weeks = Array.from(weekMap.values()).map(week => ({
    ...week,
    totalResponses: week.prompts.filter((p: any) => p.userResponse).length,
    dateRange: `Week ${week.weekNumber}` // You can calculate actual dates if needed
  }));

  return weeks;
}

/**
 * Update space settings
 */
export async function updateSpace(
  spaceId: string,
  updates: Partial<{
    name: string;
    description: string;
    rotation_type: CuratorRotationType;
    publish_day: number;
    current_curator_id: string | null;
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
