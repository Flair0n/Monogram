/**
 * Mock data for spaces - replace with Supabase queries
 * This data works with the permissions system
 */

import { Space } from './permissions';

export const mockSpaces: Space[] = [
  {
    id: 'space_1',
    name: 'Poetry & Prose',
    createdBy: 'user_1', // Alex Morgan (leader)
    curators: ['user_1', 'user_2'], // Alex and Jordan
    members: ['user_1', 'user_2', 'user_3'], // All users
  },
  {
    id: 'space_2',
    name: 'Creative Nonfiction',
    createdBy: 'user_1', // Alex Morgan (leader)
    curators: ['user_2'], // Jordan only
    members: ['user_1', 'user_2'], // Alex and Jordan
  },
  {
    id: 'space_3',
    name: 'Short Stories',
    createdBy: 'user_1', // Alex Morgan (leader)
    curators: ['user_1'], // Alex only
    members: ['user_1'], // Alex only
  },
];

/**
 * Helper to get space by ID
 */
export function getSpaceById(spaceId: string): Space | undefined {
  return mockSpaces.find(space => space.id === spaceId);
}

/**
 * Helper to get user's spaces
 */
export function getUserSpaces(userId: string): Space[] {
  return mockSpaces.filter(space => space.members.includes(userId));
}

/**
 * Helper to check if user is curator in space
 */
export function isUserCurator(userId: string, spaceId: string): boolean {
  const space = getSpaceById(spaceId);
  return space ? space.curators.includes(userId) : false;
}

/**
 * Helper to check if user is space creator
 */
export function isSpaceCreator(userId: string, spaceId: string): boolean {
  const space = getSpaceById(spaceId);
  return space ? space.createdBy === userId : false;
}
