/**
 * RestrictedAction Component
 * Wraps UI elements with permission checks and provides disabled states with tooltips
 * Maintains Monogram's warm minimal aesthetic for disabled states
 */

import { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, getPermissionMessage, Space } from '../../lib/permissions';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface RestrictedActionProps {
  children: ReactNode;
  permission: Parameters<typeof hasPermission>[0];
  space?: Space;
  fallback?: 'disable' | 'hide';
  showTooltip?: boolean;
  className?: string;
}

export function RestrictedAction({
  children,
  permission,
  space,
  fallback = 'disable',
  showTooltip = true,
  className = '',
}: RestrictedActionProps) {
  const { user } = useAuth();

  if (!user) {
    return fallback === 'hide' ? null : <>{children}</>;
  }

  const allowed = hasPermission(permission, user, space);

  // Hide the element if not allowed and fallback is 'hide'
  if (!allowed && fallback === 'hide') {
    return null;
  }

  // If allowed, render normally
  if (allowed) {
    return <>{children}</>;
  }

  // If not allowed and fallback is 'disable', render with disabled state
  const message = getPermissionMessage(permission);

  const disabledContent = (
    <div className={`restricted-action ${className}`}>
      <div className="pointer-events-none opacity-40 select-none">
        {children}
      </div>
    </div>
  );

  // Wrap with tooltip if enabled
  if (showTooltip) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            {disabledContent}
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="bg-terracotta/90 text-white border-terracotta text-xs"
          >
            <p>{message}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return disabledContent;
}

/**
 * Hook version for conditional logic in components
 */
export function usePermission(
  permission: Parameters<typeof hasPermission>[0],
  space?: Space
): { allowed: boolean; message: string } {
  const { user } = useAuth();

  if (!user) {
    return { allowed: false, message: 'Not authenticated' };
  }

  const allowed = hasPermission(permission, user, space);
  const message = getPermissionMessage(permission);

  return { allowed, message };
}
