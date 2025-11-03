/**
 * Permissions module exports
 * Import from here to use the permission system
 */

export { RestrictedAction, usePermission } from './RestrictedAction';
export { PermissionButton } from './PermissionButton';
export { permissions, hasPermission, getPermissionMessage } from '../../lib/permissions';
export type { User, UserRole, Space } from '../../lib/permissions';
