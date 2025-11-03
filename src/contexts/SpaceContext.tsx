import { createContext, useContext, useState, ReactNode } from 'react';

interface Space {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  currentWeek: number;
  currentCurator: string;
}

interface SpaceContextType {
  currentSpace: Space | null;
  setCurrentSpace: (space: Space | null) => void;
  isInSpace: boolean;
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

export function SpaceProvider({ children }: { children: ReactNode }) {
  const [currentSpace, setCurrentSpace] = useState<Space | null>(null);

  const isInSpace = currentSpace !== null;

  return (
    <SpaceContext.Provider value={{ currentSpace, setCurrentSpace, isInSpace }}>
      {children}
    </SpaceContext.Provider>
  );
}

export function useSpace() {
  const context = useContext(SpaceContext);
  if (context === undefined) {
    throw new Error('useSpace must be used within a SpaceProvider');
  }
  return context;
}
