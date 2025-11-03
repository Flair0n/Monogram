/**
 * Role-based permissions system for Monogram
 * This file defines permission rules for different user roles.
 * When integrating with Supabase, simply replace mock user data
 * without changing this permission logic.
 */

export type UserRole = 'leader' | 'curator' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  spacesJoined: string[];
  createdAt: string;
}

export interface Space {
  id: string;
  name: string;
  createdBy: string;
  curators: string[];
  members: string[];
}

/**
 * Permission rules based on user role
 */
export const permissions = {
  /**
   * Leaders can create new spaces
   */
  canCreateSpace: (user: User): boolean => {
    return user.role === 'leader';
  },

  /**
   * Leaders and curators can edit space details
   */
  canEditSpace: (user: User, space: Space): boolean => {
    if (user.role === 'leader') return true;
    if (user.role === 'curator' && space.curators.includes(user.id)) return true;
    return false;
  },

  /**
   * Only leaders can manage members (add, remove, change roles)
   */
  canManageMembers: (user: User, space: Space): boolean => {
    return user.role === 'leader' && space.createdBy === user.id;
  },

  /**
   * Leaders and curators can set weekly questions
   */
  canSetQuestions: (user: User, space: Space): boolean => {
    if (user.role === 'leader') return true;
    if (user.role === 'curator' && space.curators.includes(user.id)) return true;
    return false;
  },

  /**
   * Leaders can delete spaces they created
   */
  canDeleteSpace: (user: User, space: Space): boolean => {
    return user.role === 'leader' && space.createdBy === user.id;
  },

  /**
   * Curators can moderate content (edit/delete responses)
   */
  canModerateContent: (user: User, space: Space): boolean => {
    if (user.role === 'leader') return true;
    if (user.role === 'curator' && space.curators.includes(user.id)) return true;
    return false;
  },

  /**
   * All members can submit responses
   */
  canSubmitResponse: (user: User, space: Space): boolean => {
    return space.members.includes(user.id);
  },

  /**
   * All members can view space content
   */
  canViewSpace: (user: User, space: Space): boolean => {
    return space.members.includes(user.id);
  },

  /**
   * Leaders can promote members to curators
   */
  canPromoteToCurator: (user: User, space: Space): boolean => {
    return user.role === 'leader' && space.createdBy === user.id;
  },

  /**
   * Only leaders can access space settings
   */
  canAccessSettings: (user: User, space: Space): boolean => {
    return user.role === 'leader' && space.createdBy === user.id;
  },
};

/**
 * Permission messages for tooltips/disabled states
 */
export const permissionMessages = {
  canCreateSpace: 'Only leaders can create new spaces',
  canEditSpace: 'Only leaders and curators can edit this space',
  canManageMembers: 'Only leaders can manage members',
  canSetQuestions: 'Only leaders and curators can set questions',
  canDeleteSpace: 'Only leaders can delete spaces',
  canModerateContent: 'Only leaders and curators can moderate content',
  canSubmitResponse: 'You must be a member of this space to submit responses',
  canViewSpace: 'You must be a member to view this space',
  canPromoteToCurator: 'Only leaders can promote members',
  canAccessSettings: 'Only leaders can access space settings',
};

/**
 * Helper function to check if user has permission
 */
export function hasPermission(
  permissionKey: keyof typeof permissions,
  user: User,
  space?: Space
): boolean {
  const permissionFn = permissions[permissionKey];
  
  // For permissions that require space context
  if (space) {
    return permissionFn(user, space);
  }
  
  // For permissions that don't require space context (like canCreateSpace)
  // Pass empty space object - permission functions handle this
  return permissionFn(user, {} as Space);
}

/**
 * Get permission message for a specific permission
 */
export function getPermissionMessage(permissionKey: keyof typeof permissionMessages): string {
  return permissionMessages[permissionKey];
}
