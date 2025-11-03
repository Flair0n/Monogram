/**
 * PermissionButton Component
 * A button that respects permissions and shows appropriate disabled states
 * Styled with Monogram's warm minimal aesthetic (muted clay tones for disabled)
 */

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { usePermission } from './RestrictedAction';
import { Space } from '../../lib/permissions';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { cn } from '../ui/utils';

interface PermissionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  permission: Parameters<typeof usePermission>[0];
  space?: Space;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showTooltip?: boolean;
}

export const PermissionButton = forwardRef<HTMLButtonElement, PermissionButtonProps>(
  ({ permission, space, showTooltip = true, className, children, ...props }, ref) => {
    const { allowed, message } = usePermission(permission, space);

    const button = (
      <Button
        ref={ref}
        disabled={!allowed}
        className={cn(
          // Muted clay tones for disabled state
          !allowed && 'bg-terracotta/20 text-terracotta/60 border-terracotta/30 hover:bg-terracotta/20 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );

    // If not allowed and tooltip enabled, wrap with tooltip
    if (!allowed && showTooltip) {
      return (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              {button}
            </TooltipTrigger>
            <TooltipContent 
              side="top" 
              className="bg-terracotta/90 text-white border-terracotta text-xs max-w-[200px]"
            >
              <p>{message}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return button;
  }
);

PermissionButton.displayName = 'PermissionButton';
