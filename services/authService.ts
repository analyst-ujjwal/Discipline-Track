
import { User } from '../types';
import { db } from './db';

const SESSION_KEY = 'zenith_session';

export const authService = {
  login: async (email: string, passwordPlain: string): Promise<User | null> => {
    // In a real app, password hashing happens on server
    const user = db.users.find(email);
    if (user && user.passwordHash === passwordPlain) { // Simple mock comparison
      const userData: User = { id: user.id, email: user.email, createdAt: user.createdAt };
      localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
      return userData;
    }
    return null;
  },

  signup: async (email: string, passwordPlain: string): Promise<User | null> => {
    const existing = db.users.find(email);
    if (existing) return null;

    const newUser = {
      id: crypto.randomUUID(),
      email,
      passwordHash: passwordPlain, // Simulated hashing
      createdAt: new Date().toISOString(),
    };

    db.users.create(newUser);
    const userData: User = { id: newUser.id, email: newUser.email, createdAt: newUser.createdAt };
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    return userData;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getSession: (): User | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }
};
