import { LoginUseCase } from "@/application/auth/LoginUseCase";
import { SignUpUseCase } from "@/application/auth/SignUpUseCase";
import { User } from "@/domain/entities/User"; 
import { IAnalyticsPort } from "@/ports/IAnalyticsPort";
import { IAuthPort } from "@/ports/IAuthPort";
import React, { createContext, ReactNode, useEffect } from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  authPort: IAuthPort;
  analyticsPort: IAnalyticsPort;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, authPort, analyticsPort }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  const loginUseCase = new LoginUseCase(authPort, analyticsPort);
  const signUpUseCase = new SignUpUseCase(authPort, analyticsPort);

  useEffect(() => {
    const unsubscribe = authPort.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [authPort]);

  const signUp = async (email: string, password: string): Promise<void> => {
    const newUser = await signUpUseCase.execute(email, password);
    setUser(newUser);
  };

  const login = async (email: string, password: string): Promise<void> => {
    const loggedInUser = await loginUseCase.execute(email, password);
    setUser(loggedInUser);
  };

  const logout = async (): Promise<void> => {
    analyticsPort.trackEvent('Authentication', 'Logout', user?.email ?? 'unknown');
    await authPort.logout();
    setUser(null);
  };

  const getToken = async (): Promise<string | null> => {
    return authPort.getToken();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signUp, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};