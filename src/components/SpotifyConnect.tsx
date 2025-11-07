/**
 * SpotifyConnect Component
 * Displays Spotify connection status and provides connect/disconnect functionality
 */

import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Music, Check, X } from 'lucide-react';

interface SpotifyConnectProps {
  isConnected: boolean;
  isLoading?: boolean;
  onConnect: () => void;
  onDisconnect?: () => void;
  userName?: string;
  compact?: boolean;
}

export function SpotifyConnect({
  isConnected,
  isLoading = false,
  onConnect,
  onDisconnect,
  userName,
  compact = false,
}: SpotifyConnectProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <Badge variant="default" className="bg-sage text-cream gap-1">
              <Check className="w-3 h-3" />
              Spotify Connected
            </Badge>
            {onDisconnect && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDisconnect}
                disabled={isLoading}
                className="h-6 px-2"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onConnect}
            disabled={isLoading}
            className="gap-2"
          >
            <Music className="w-4 h-4" />
            Connect Spotify
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="p-6 paper-texture border-sage/20">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center">
            <Music className="w-6 h-6 text-sage" />
          </div>
          <div>
            <h3 className="font-medium mb-1">Spotify Integration</h3>
            {isConnected ? (
              <>
                <p className="text-sm text-muted-foreground mb-2">
                  Connected {userName && `as ${userName}`}
                </p>
                <Badge variant="default" className="bg-sage text-cream gap-1">
                  <Check className="w-3 h-3" />
                  Connected
                </Badge>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Connect your Spotify account to use "Now Playing" and create playlists
              </p>
            )}
          </div>
        </div>
        <div>
          {isConnected ? (
            onDisconnect && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDisconnect}
                disabled={isLoading}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Disconnect
              </Button>
            )
          ) : (
            <Button
              onClick={onConnect}
              disabled={isLoading}
              className="gap-2 bg-sage hover:bg-sage/90 text-cream"
            >
              <Music className="w-4 h-4" />
              {isLoading ? 'Connecting...' : 'Connect Spotify'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
