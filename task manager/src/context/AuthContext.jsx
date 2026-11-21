import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USER } from '../data/initialData';

const AuthContext = createContext();

const USERS_STORAGE_KEY = 'taskflow_registered_users';
const CURRENT_USER_KEY = 'taskflow_user';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(CURRENT_USER_KEY);
      if (savedUser) {
        return JSON.parse(savedUser);
      }
      // Initialize with default professional account on first run
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(INITIAL_USER));
      return INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      const defaults = [
        {
          id: INITIAL_USER.id,
          name: INITIAL_USER.name,
          email: INITIAL_USER.email,
          password: 'password123',
          role: INITIAL_USER.role,
          workspace: INITIAL_USER.workspace,
        }
      ];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error('Failed to sync auth state to localStorage', e);
    }
  }, [currentUser]);

  const login = (email, password) => {
    // Check registered accounts first
    const existing = registeredUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (existing) {
      if (existing.password && existing.password !== password) {
        return { success: false, error: 'Incorrect password. Please verify your credentials.' };
      }
      const userProfile = {
        ...INITIAL_USER,
        ...existing,
      };
      setCurrentUser(userProfile);
      return { success: true, user: userProfile };
    }

    // Default commercial SaaS fallback behavior: create profile if valid credentials provided
    const nameFromEmail = email.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = nameFromEmail
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || 'Product Member';

    const newUser = {
      ...INITIAL_USER,
      id: 'usr_' + Date.now().toString(36),
      name: formattedName,
      email: email.trim(),
      password,
      role: 'Product Lead',
      workspace: 'Workspace Studio',
      memberSince: 'Today'
    };

    const updated = [...registeredUsers, newUser];
    setRegisteredUsers(updated);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
    setCurrentUser(newUser);

    return { success: true, user: newUser };
  };

  const register = (userData) => {
    const { name, email, password, role, workspace } = userData;

    const existing = registeredUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (existing) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const newUser = {
      ...INITIAL_USER,
      id: 'usr_' + Date.now().toString(36),
      name: name.trim(),
      email: email.trim(),
      password,
      role: role?.trim() || 'Product Specialist',
      workspace: workspace?.trim() || 'Primary Workspace',
      department: 'Product & Operations',
      memberSince: 'Just now',
    };

    const updated = [...registeredUsers, newUser];
    setRegisteredUsers(updated);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
    setCurrentUser(newUser);

    return { success: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const updateProfile = (updatedFields) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedFields };
    setCurrentUser(updated);

    // Update registered list if email/name changed
    const userList = registeredUsers.map(u => u.id === currentUser.id ? { ...u, ...updatedFields } : u);
    setRegisteredUsers(userList);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(userList));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

