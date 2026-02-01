import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  AuthError,
} from 'firebase/auth';
import { auth } from '../firebase';

// Define context shape
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  // Cái này sẽ tự trigger khi user login/logout hoặc khi app reload (Firebase tự restore session)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup
  }, []);

  // Sign Up
  const signUp = async (email: string, password: string): Promise<void> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged sẽ tự update user state
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(getAuthErrorMessage(authError.code));
    }
  };

  // Login
  const login = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(getAuthErrorMessage(authError.code));
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error('Failed to logout');
    }
  };

  // Get fresh ID token (tự refresh nếu expired)
  const getToken = async (): Promise<string | null> => {
    if (!user) return null;
    try {
      // forceRefresh = true → Firebase tự lấy token mới nếu cần
      const token = await user.getIdToken(true);
      return token;
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper: map Firebase error codes → user-friendly messages
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Email đã được sử dụng. Thử email khác hoặc đăng nhập.';
    case 'auth/invalid-email':
      return 'Email không hợp lệ.';
    case 'auth/weak-password':
      return 'Mật khẩu quá yếu. Cần ít nhất 6 ký tự.';
    case 'auth/user-not-found':
      return 'Không tìm thấy tài khoản với email này.';
    case 'auth/wrong-password':
      return 'Mật khẩu không đúng.';
    case 'auth/invalid-credential':
      return 'Email hoặc mật khẩu không đúng.';
    case 'auth/too-many-requests':
      return 'Quá nhiều lần thử. Vui lòng đợi một lúc.';
    default:
      return 'Lỗi xác thực không xác định.';
  }
}
