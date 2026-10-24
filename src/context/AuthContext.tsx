import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, UserRole } from '../types';
import { INITIAL_EMPLOYEES } from '../utils/storage';

export interface AuthSession {
  role: UserRole;
  email: string;
  fullName: string;
  employeeId?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: AuthSession | null;
  loginEmployer: (email: string, pass: string) => boolean;
  loginEmployee: (identifier: string, pass: string, employees: Employee[]) => boolean;
  quickSwitch: (role: UserRole, employeeId?: string, employees?: Employee[]) => void;
  logout: () => void;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'wt_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthSession | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const notify = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  const loginEmployer = (email: string, pass: string): boolean => {
    // Employer admin credentials validation
    if ((email === 'admin@worktrack.io' || email.includes('admin')) && pass.length >= 4) {
      const session: AuthSession = {
        role: 'EMPLOYER',
        email: email,
        fullName: 'Executive Administrator',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      };
      setUser(session);
      notify('Welcome back, Administrator. Employer Command Center active.');
      return true;
    }
    notify('Invalid employer credentials. Use admin@worktrack.io / admin123', 'error');
    return false;
  };

  const loginEmployee = (identifier: string, pass: string, employees: Employee[]): boolean => {
    const cleanId = identifier.trim().toLowerCase();
    const found = employees.find(
      (e) =>
        (e.email.toLowerCase() === cleanId || e.employeeCode.toLowerCase() === cleanId) &&
        (pass === 'password123' || pass === e.temporaryPassword || pass.length >= 4)
    );

    if (found) {
      const session: AuthSession = {
        role: 'EMPLOYEE',
        email: found.email,
        fullName: found.fullName,
        employeeId: found.id,
        avatarUrl: found.avatarUrl,
      };
      setUser(session);
      notify(`Welcome back, ${found.fullName}!`);
      return true;
    }

    notify('Invalid Employee ID or password. (Try sarah.j@worktrack.io / password123)', 'error');
    return false;
  };

  const quickSwitch = (role: UserRole, employeeId?: string, employees: Employee[] = INITIAL_EMPLOYEES) => {
    if (role === 'EMPLOYER') {
      setUser({
        role: 'EMPLOYER',
        email: 'admin@worktrack.io',
        fullName: 'Executive Administrator',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      });
      notify('Switched to Employer Portal (Admin)');
    } else {
      const targetEmp = employees.find((e) => e.id === employeeId) || employees[0];
      setUser({
        role: 'EMPLOYEE',
        email: targetEmp.email,
        fullName: targetEmp.fullName,
        employeeId: targetEmp.id,
        avatarUrl: targetEmp.avatarUrl,
      });
      notify(`Switched to Employee Portal (${targetEmp.fullName})`);
    }
  };

  const logout = () => {
    setUser(null);
    notify('Signed out successfully.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginEmployer,
        loginEmployee,
        quickSwitch,
        logout,
        notification,
        notify,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
