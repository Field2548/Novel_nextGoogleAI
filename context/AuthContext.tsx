
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { apiService } from '../services/apiService';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<User | null>;
  signup: (username: string, email: string, pass: string) => Promise<User | null>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // This could be extended to check for a token in localStorage
    const loggedInUser = sessionStorage.getItem('user');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    try {
      const loggedUser = await apiService.login(email, pass);
      if (loggedUser) {
        setUser(loggedUser);
        sessionStorage.setItem('user', JSON.stringify(loggedUser));
      }
      return loggedUser;
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  }, []);
  
  const signup = useCallback(async (username: string, email: string, pass: string) => {
    try {
        const newUser = await apiService.signup(username, email, pass);
        if(newUser) {
            setUser(newUser);
            sessionStorage.setItem('user', JSON.stringify(newUser));
        }
        return newUser;
    } catch(error) {
        console.error('Signup failed:', error);
        return null;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('user');
    window.location.hash = '';
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
