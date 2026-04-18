import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "driver" | "helper";

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  // Future auth state like user data, tokens, etc can go here
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("driver");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ role, setRole, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
