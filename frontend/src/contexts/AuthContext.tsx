import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Business } from '../types';
import { AuthService } from '../services/auth.service';
import { BusinessService } from '../services/business.service';

interface AuthContextType {
  user: User | null;
  activeBusiness: Business | null;
  businesses: Business[];
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: 'applicant' | 'admin' | 'officer') => Promise<void>;
  setActiveBusiness: (business: Business) => void;
  refreshBusinesses: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeBusiness, setActiveBusinessState] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('industria_token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      const profile = await AuthService.getProfile();
      setUser(profile);

      const bizList = await BusinessService.list();
      setBusinesses(bizList);
      if (bizList.length > 0) {
        const savedBizId = localStorage.getItem('industria_active_biz_id');
        const found = bizList.find((b) => b.id.toString() === savedBizId);
        setActiveBusinessState(found || bizList[0]);
      }
    } catch (err) {
      console.error('Session restoration failed:', err);
      localStorage.removeItem('industria_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await AuthService.login(email, pass);
      localStorage.setItem('industria_token', res.access_token);
      setUser(res.user);

      const bizList = await BusinessService.list();
      setBusinesses(bizList);
      if (bizList.length > 0) {
        setActiveBusinessState(bizList[0]);
        localStorage.setItem('industria_active_biz_id', bizList[0].id.toString());
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('industria_token');
    localStorage.removeItem('industria_active_biz_id');
    setUser(null);
    setActiveBusinessState(null);
    setBusinesses([]);
  };

  const switchDemoRole = async (role: 'applicant' | 'admin' | 'officer') => {
    const email = role === 'admin' ? 'admin@industria.ai' : (role === 'officer' ? 'officer@industria.ai' : 'applicant@industria.ai');
    await login(email, 'password123');
  };

  const setActiveBusiness = (business: Business) => {
    setActiveBusinessState(business);
    localStorage.setItem('industria_active_biz_id', business.id.toString());
  };

  const refreshBusinesses = async () => {
    try {
      const bizList = await BusinessService.list();
      setBusinesses(bizList);
      if (bizList.length > 0 && !activeBusiness) {
        setActiveBusinessState(bizList[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeBusiness,
        businesses,
        isLoading,
        login,
        logout,
        switchDemoRole,
        setActiveBusiness,
        refreshBusinesses,
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
