import { createContext, useContext, useState, ReactNode } from 'react';
import { User as PermissionUser, UserRole } from '../lib/permissions';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  updateUserRole: (role: UserRole) => void;
}

// Extend the User interface from permissions for auth context
interface User extends PermissionUser {}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Mock users database - replace with Supabase queries
 * This demonstrates different user roles for testing
 */
const mockUsers: Record<string, User> = {
  'leader@monogram.com': {
    id: 'user_1',
    name: 'Alex Morgan',
    email: 'leader@monogram.com',
    role: 'leader',
    spacesJoined: ['space_1', 'space_2', 'space_3'],
    createdAt: '2024-01-15T10:00:00Z',
  },
  'curator@monogram.com': {
    id: 'user_2',
    name: 'Jordan Lee',
    email: 'curator@monogram.com',
    role: 'curator',
    spacesJoined: ['space_1', 'space_2'],
    createdAt: '2024-02-20T10:00:00Z',
  },
  'member@monogram.com': {
    id: 'user_3',
    name: 'Taylor Swift',
    email: 'member@monogram.com',
    role: 'member',
    spacesJoined: ['space_1'],
    createdAt: '2024-03-10T10:00:00Z',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string) => {
    // Mock login - replace with Supabase auth later
    console.log('Mock login:', email);
    
    // Get mock user based on email, default to leader role
    const mockUser = mockUsers[email] || {
      id: 'user_default',
      name: 'Alex Morgan',
      email: email,
      role: 'leader' as UserRole,
      spacesJoined: ['space_1', 'space_2', 'space_3'],
      createdAt: new Date().toISOString(),
    };
    
    setIsAuthenticated(true);
    setUser(mockUser);
  };

  const updateUserRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUserRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
