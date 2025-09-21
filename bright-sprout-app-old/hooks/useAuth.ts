import { createContext, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string | null;
  firstName?: string;
  lastName?: string;
  role?: 'Parent' | 'Child'; // Assuming roles are 'Parent' or 'Child'
  name?: string; // For cases where firstName/lastName might not be present
}

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthStatusProvider');
  }
  return context;
};