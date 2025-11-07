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
  responseType?: 'TEXT' | 'IMAGE' | 'SPOTIFY';
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
      response_type: data.responseType || 'TEXT',
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

/**
 * Get all responses for a specific week (for curator review)
 */
export async function getWeekResponses(spaceId: string, weekNumber: number) {
  // Get all prompts for the week
  const { data: prompts, error: promptsError } = await supabase
    .from('prompts')
    .select('id')
    .eq('space_id', spaceId)
    .eq('week_number', weekNumber)
    .eq('is_published', true);

  if (promptsError) throw promptsError;

  const promptIds = prompts?.map(p => p.id) || [];

  if (promptIds.length === 0) {
    return [];
  }

  // Get all responses for these prompts
  const { data: responses, error: responsesError } = await supabase
    .from('responses')
    .select(`
      *,
      user:users(id, name, avatar_url),
      prompt:prompts(id, question, response_type)
    `)
    .in('prompt_id', promptIds)
    .eq('is_draft', false)
    .order('created_at', { ascending: false });

  if (responsesError) throw responsesError;

  return responses || [];
}

/**
 * Get member submission status for the week
 */
export async function getWeekSubmissionStatus(spaceId: string, weekNumber: number) {
  // Get all members
  const { data: members, error: membersError } = await supabase
    .from('memberships')
    .select(`
      user_id,
      user:users!memberships_user_id_fkey(id, name, avatar_url)
    `)
    .eq('space_id', spaceId);

  if (membersError) throw membersError;

  // Get all prompts for the week
  const { data: prompts, error: promptsError } = await supabase
    .from('prompts')
    .select('id')
    .eq('space_id', spaceId)
    .eq('week_number', weekNumber)
    .eq('is_published', true);

  if (promptsError) throw promptsError;

  const promptIds = prompts?.map(p => p.id) || [];

  // Get all responses for the week
  const { data: responses, error: responsesError } = await supabase
    .from('responses')
    .select('user_id, prompt_id, created_at')
    .in('prompt_id', promptIds)
    .eq('is_draft', false);

  if (responsesError) throw responsesError;

  // Calculate submission status for each member
  const submissionStatus = members?.map(member => {
    const userResponses = responses?.filter(r => r.user_id === member.user_id) || [];
    const hasSubmitted = userResponses.length > 0;
    const responseCount = userResponses.length;
    const lastSubmission = userResponses.length > 0 
      ? new Date(Math.max(...userResponses.map(r => new Date(r.created_at).getTime())))
      : null;

    // Handle user data (could be object or array from Supabase)
    const userData = Array.isArray(member.user) ? member.user[0] : member.user;

    return {
      userId: member.user_id,
      userName: userData?.name || 'Unknown',
      avatarUrl: userData?.avatar_url || null,
      hasSubmitted,
      responseCount,
      totalPrompts: promptIds.length,
      lastSubmission,
    };
  }) || [];

  return submissionStatus;
}

/**
 * Get Spotify responses for a specific week
 */
export async function getWeekSpotifyResponses(spaceId: string, weekNumber: number) {
  // Get all prompts for the week with SPOTIFY response type
  const { data: prompts, error: promptsError } = await supabase
    .from('prompts')
    .select('id, question')
    .eq('space_id', spaceId)
    .eq('week_number', weekNumber)
    .eq('response_type', 'SPOTIFY')
    .eq('is_published', true);

  if (promptsError) throw promptsError;

  const promptIds = prompts?.map(p => p.id) || [];

  if (promptIds.length === 0) {
    return [];
  }

  // Get all Spotify responses for these prompts
  const { data: responses, error: responsesError } = await supabase
    .from('responses')
    .select(`
      id,
      content,
      music_url,
      image_url,
      created_at,
      user:users!responses_user_id_fkey(id, name),
      prompt:prompts!responses_prompt_id_fkey(id, question)
    `)
    .in('prompt_id', promptIds)
    .eq('is_draft', false)
    .not('music_url', 'is', null)
    .order('created_at', { ascending: false });

  if (responsesError) throw responsesError;

  // Parse track metadata from content field
  return responses?.map(response => {
    let trackMetadata: any = {};
    try {
      trackMetadata = JSON.parse(response.content || '{}');
    } catch (e) {
      console.warn('Failed to parse track metadata:', response.content);
    }

    // Handle user data (could be object or array from Supabase)
    const userData = Array.isArray(response.user) ? response.user[0] : response.user;
    const promptData = Array.isArray(response.prompt) ? response.prompt[0] : response.prompt;

    return {
      trackId: trackMetadata.trackId || '',
      trackName: trackMetadata.trackName || 'Unknown Track',
      artistName: trackMetadata.artistName || 'Unknown Artist',
      albumName: trackMetadata.albumName || 'Unknown Album',
      spotifyUrl: response.music_url || '',
      albumArtUrl: response.image_url || '',
      duration: trackMetadata.duration || 0,
    };
  }) || [];
}

/**
 * Publish week and create newsletter draft
 */
export async function publishWeek(spaceId: string, weekNumber: number) {
  const now = new Date().toISOString();

  // Update space to mark week as published
  const { error: spaceError } = await supabase
    .from('spaces')
    .update({
      is_published: true,
      updated_at: now,
    })
    .eq('id', spaceId);

  if (spaceError) throw spaceError;

  // Create newsletter draft entry
  const { data: newsletter, error: newsletterError } = await supabase
    .from('newsletters')
    .insert({
      space_id: spaceId,
      week_number: weekNumber,
      status: 'DRAFT',
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (newsletterError) throw newsletterError;

  return newsletter;
}

/**
 * Invite member to space via email
 */
export async function inviteMember(spaceId: string, email: string, invitedBy: string) {
  const now = new Date().toISOString();

  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUser) {
    // User exists, add them directly to the space
    const { error: membershipError } = await supabase
      .from('memberships')
      .insert({
        space_id: spaceId,
        user_id: existingUser.id,
        role: 'MEMBER',
        joined_at: now,
      });

    if (membershipError) throw membershipError;
    return { success: true, message: 'Member added to space' };
  } else {
    // User doesn't exist, send invitation email
    // TODO: Implement email invitation system
    console.log('Sending invitation email to:', email);
    return { success: true, message: 'Invitation sent via email' };
  }
}

/**
 * Remove member from space
 */
export async function removeMember(spaceId: string, userId: string) {
  const { error } = await supabase
    .from('memberships')
    .delete()
    .eq('space_id', spaceId)
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Update response
 */
export async function updateResponse(responseId: string, content: string, imageUrl?: string) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('responses')
    .update({
      content: content,
      image_url: imageUrl || null,
      updated_at: now,
    })
    .eq('id', responseId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Compile newsletter content for a week
 */
export async function compileNewsletter(spaceId: string, weekNumber: number) {
  // Get all prompts for the week
  const { data: prompts, error: promptsError } = await supabase
    .from('prompts')
    .select(`
      *,
      curator:users(id, name)
    `)
    .eq('space_id', spaceId)
    .eq('week_number', weekNumber)
    .eq('is_published', true)
    .order('order', { ascending: true });

  if (promptsError) throw promptsError;

  const promptIds = prompts?.map(p => p.id) || [];

  // Get all responses for these prompts
  const { data: responses, error: responsesError } = await supabase
    .from('responses')
    .select(`
      *,
      user:users(id, name, avatar_url),
      prompt:prompts(id, question, order)
    `)
    .in('prompt_id', promptIds)
    .eq('is_draft', false)
    .order('created_at', { ascending: true });

  if (responsesError) throw responsesError;

  // Compile newsletter content
  const newsletterContent = {
    weekNumber,
    prompts: prompts?.map(prompt => ({
      question: prompt.question,
      order: prompt.order,
      responses: responses?.filter(r => r.prompt_id === prompt.id).map(r => ({
        userName: r.user.name,
        content: r.content,
        imageUrl: r.image_url,
        createdAt: r.created_at,
      })) || [],
    })) || [],
    curator: prompts?.[0]?.curator?.name || 'Unknown',
    totalResponses: responses?.length || 0,
  };

  return newsletterContent;
}

/**
 * Rotate curator to next member
 */
export async function rotateCurator(spaceId: string) {
  const now = new Date().toISOString();

  // Get space details
  const { data: space, error: spaceError } = await supabase
    .from('spaces')
    .select('current_curator_id, rotation_type, current_week')
    .eq('id', spaceId)
    .single();

  if (spaceError) throw spaceError;

  if (space.rotation_type === 'MANUAL') {
    // Manual rotation - don't auto-rotate
    return null;
  }

  // Get all members
  const { data: members, error: membersError } = await supabase
    .from('memberships')
    .select('user_id')
    .eq('space_id', spaceId)
    .order('joined_at', { ascending: true });

  if (membersError) throw membersError;

  if (!members || members.length === 0) {
    return null;
  }

  let nextCuratorId: string;

  if (space.rotation_type === 'RANDOM') {
    // Random selection
    const randomIndex = Math.floor(Math.random() * members.length);
    nextCuratorId = members[randomIndex].user_id;
  } else {
    // Round robin
    const currentIndex = members.findIndex(m => m.user_id === space.current_curator_id);
    const nextIndex = (currentIndex + 1) % members.length;
    nextCuratorId = members[nextIndex].user_id;
  }

  // Update space with new curator and increment week
  const { error: updateError } = await supabase
    .from('spaces')
    .update({
      current_curator_id: nextCuratorId,
      current_week: space.current_week + 1,
      is_published: false,
      updated_at: now,
    })
    .eq('id', spaceId);

  if (updateError) throw updateError;

  // Record rotation in curator_rotations table
  const { error: rotationError } = await supabase
    .from('curator_rotations')
    .insert({
      space_id: spaceId,
      curator_id: nextCuratorId,
      week_number: space.current_week + 1,
      started_at: now,
    });

  if (rotationError) console.error('Error recording rotation:', rotationError);

  return nextCuratorId;
}
