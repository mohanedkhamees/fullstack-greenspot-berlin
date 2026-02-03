import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { store } from "../store/store";
import { initializeForUser } from "../store/needsReviewSlice";

export interface User {
  username: string;
  role: "admin" | "non-admin";
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        setUser(userData);
        // Initialize needs review for this user
        store.dispatch(initializeForUser(userData.username));
      } catch (e) {
        localStorage.removeItem("user");
        store.dispatch(initializeForUser(null));
      }
    } else {
      store.dispatch(initializeForUser(null));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Ungültiger Benutzername oder Passwort");
      }
      throw new Error("Login fehlgeschlagen. Bitte versuchen Sie es später erneut.");
    }

    const userData: User = await response.json();
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    // Initialize needs review for this user
    store.dispatch(initializeForUser(userData.username));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    // Clear needs review for logged out user
    store.dispatch(initializeForUser(null));
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAdmin }}>
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
